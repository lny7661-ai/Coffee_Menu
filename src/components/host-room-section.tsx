"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Link2, Sparkles } from "lucide-react";
import { KakaoShareButton } from "@/components/kakao-share-button";
import {
  hasDuplicateSessionLabel,
  nextDefaultRoomLabel,
  tryUpsertSavedSession,
  updateSavedSessionLabel,
} from "@/lib/saved-sessions";

export function HostRoomSection() {
  /** null = 아직 확인 전 · POST /api/rooms 와 동일한 라우트에서만 판별 */
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hostName, setHostName] = useState("");
  const [roomLabel, setRoomLabel] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [roomPasswordConfirm, setRoomPasswordConfirm] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [copied, setCopied] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);
  const createInFlight = useRef(false);

  useEffect(() => {
    setPlaceholder(nextDefaultRoomLabel());
  }, []);

  /** 클릭 로그가 안 보일 때: 버튼이 DOM 에 있는지·sessionId 로 대체됐는지 확인용 */
  useEffect(() => {
    console.log("[host-room] 렌더 상태", {
      sessionId,
      sessionId있음_방만들기버튼숨김: Boolean(sessionId),
      backendReady,
      createPending,
      createInFlightRef: createInFlight.current,
      방만들기버튼_예상표시: !sessionId,
    });
  }, [sessionId, backendReady, createPending]);

  /** sessionId 구독 — null → 값 전환 시 링크 UI 로 분기되는지 추적 */
  useEffect(() => {
    if (sessionId) {
      console.log("[host-room] sessionId 설정됨 → 링크·복사 UI 분기 예정", {
        sessionId,
      });
    }
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rooms/backend-ready")
      .then(async (r) => {
        const body = (await r.json().catch(() => ({}))) as { ready?: unknown };
        if (cancelled) return;
        if (typeof body.ready === "boolean") {
          setBackendReady(body.ready);
        } else {
          setBackendReady(null);
        }
      })
      .catch(() => {
        if (!cancelled) setBackendReady(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const urls = useMemo(() => {
    if (typeof window === "undefined" || !sessionId) {
      return { participate: "", board: "" };
    }
    const origin = window.location.origin;
    return {
      participate: `${origin}/order/${sessionId}`,
      board: `${origin}/host/session/${sessionId}`,
    };
  }, [sessionId]);

  const createRoom = useCallback(async () => {
    console.log("[host-room] createRoom: enter", {
      sessionId,
      createPending,
      createInFlight: createInFlight.current,
    });

    // 중복 클릭 방지는 ref 만 사용 (createPending 과 이중 가드 시 한쪽만 true 로 남는 타이밍에 ‘먹통’처럼 보일 수 있음)
    if (createInFlight.current) {
      console.log(
        "[host-room] createRoom: stop — 중복 요청 (createInFlight 가 이미 true)",
      );
      return;
    }

    const createdBy = hostName.trim() || "익명";

    const pw = roomPassword.trim();
    const pw2 = roomPasswordConfirm.trim();
    console.log("[host-room] createRoom: 검증 — 비밀번호 길이", {
      pwLen: pw.length,
      confirmLen: pw2.length,
      일치: pw === pw2,
    });
    if (pw.length < 4) {
      console.log("[host-room] createRoom: stop — 비밀번호 길이 부족 (4자 미만)");
      setPasswordError("비밀번호는 4자 이상으로 설정해 주세요.");
      return;
    }
    if (pw !== pw2) {
      console.log("[host-room] createRoom: stop — 비밀번호와 확인이 일치하지 않음");
      setPasswordError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setPasswordError(null);

    const label = roomLabel.trim() || nextDefaultRoomLabel();
    const dup = hasDuplicateSessionLabel(label);
    console.log("[host-room] createRoom: 검증 — 중복 방 이름", { label, 중복: dup });
    if (dup) {
      console.log("[host-room] createRoom: stop — 저장된 세션과 동일한 방 이름");
      setDuplicateError(true);
      return;
    }
    setDuplicateError(false);

    createInFlight.current = true;
    setCreatePending(true);
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 45_000);
    const onAbort = () => {
      console.warn(
        "[host-room] POST /api/rooms Abort/Cancel (타임아웃·탭 이동·수동 중단 등). Network 탭에서 canceled 여부 확인.",
      );
    };
    controller.signal.addEventListener("abort", onAbort, { once: true });

    const t0 = performance.now();
    const slowPendingTimer = window.setTimeout(() => {
      console.warn(
        "[host-room] POST /api/rooms 5초 경과 — 아직 응답 전입니다. DevTools Network 에서 (pending) 인지 확인하세요.",
      );
    }, 5_000);

    try {
      console.log("[host-room] createRoom: fetch POST /api/rooms", {
        room_name: label,
        passwordLen: pw.length,
      });
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_name: label, password: pw }),
        signal: controller.signal,
        cache: "no-store",
      });
      const elapsedMs = Math.round(performance.now() - t0);
      console.log("[host-room] createRoom: fetch 응답", {
        status: res.status,
        ok: res.ok,
        statusText: res.statusText,
        elapsedMs,
      });
      const body = (await res.json().catch((parseErr) => {
        console.error("[host-room] createRoom: JSON 파싱 실패", parseErr);
        return {};
      })) as {
        id?: string;
        error?: string;
        hint?: string;
      };
      console.log("[host-room] createRoom: 응답 본문", body);

      if (!res.ok) {
        console.log("[host-room] createRoom: 결과: 실패 (HTTP 오류)");
        const main = body.error ?? "방을 만들지 못했습니다.";
        const hint = body.hint?.trim();
        setPasswordError(hint ? `${main} (${hint})` : main);
        return;
      }
      const id = body.id;
      if (!id) {
        console.log("[host-room] createRoom: 결과: 실패 (응답에 id 없음)");
        setPasswordError("응답에 방 ID 가 없습니다.");
        return;
      }

      console.log("[host-room] createRoom: 결과: 성공", { id });
      const createdAt = new Date().toISOString();
      const stored = tryUpsertSavedSession({
        id,
        label,
        createdAt,
        createdBy,
      });
      if (!stored) {
        console.error(
          "[host-room] localStorage 저장 실패 — sessionId 는 그대로 반영합니다(용량·프라이빗 모드 등).",
        );
      }
      setSessionId(id);
      setRoomLabel(label);
      setRoomPassword("");
      setRoomPasswordConfirm("");
      setCopied(false);
      window.dispatchEvent(new Event("saved-sessions-changed"));
      console.log(
        "[host-room] setSessionId 등 상태 갱신 호출 완료 (React 18 은 같은 틱에서 배치 리렌더)",
        { id },
      );
    } catch (e) {
      console.error("[host-room] createRoom: stop — 네트워크 또는 예외", {
        name: e instanceof Error ? e.name : typeof e,
        message: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
        raw: e,
      });
      if (e instanceof Error && e.name === "AbortError") {
        setPasswordError(
          "요청 시간이 초과되었습니다. 네트워크·Supabase 연결을 확인한 뒤 다시 눌러 주세요.",
        );
      } else {
        const detail =
          e instanceof Error && e.message ? ` (${e.message})` : "";
        setPasswordError(`네트워크 오류로 방을 만들지 못했습니다.${detail}`);
      }
    } finally {
      window.clearTimeout(slowPendingTimer);
      clearTimeout(abortTimer);
      createInFlight.current = false;
      setCreatePending(false);
      console.log("[host-room] createRoom: finally — createPending·createInFlight 해제 보장");
    }
  }, [hostName, roomLabel, roomPassword, roomPasswordConfirm]);

  const copyParticipate = useCallback(async () => {
    if (!urls.participate || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(urls.participate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [urls.participate]);

  const onLabelBlur = useCallback(() => {
    if (!sessionId) return;
    updateSavedSessionLabel(sessionId, roomLabel);
    window.dispatchEvent(new Event("saved-sessions-changed"));
  }, [sessionId, roomLabel]);

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-zinc-800">
        <Sparkles className="h-5 w-5 text-zinc-500" strokeWidth={2} />
        <h2 className="font-semibold">방 만들기 · 링크 공유</h2>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        방 이름·비밀번호를 설정하면 참가 링크가 생깁니다. 비밀번호는 취합
        상세·엑셀 보기에만 사용됩니다.
      </p>

      <label className="mt-4 block text-sm font-medium text-zinc-700">
        주최자 이름 (선택)
        <input
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="비워 두면 익명"
          disabled={Boolean(sessionId)}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-zinc-700">
        방 이름
        <input
          type="text"
          value={roomLabel}
          onChange={(e) => {
            setRoomLabel(e.target.value);
            setDuplicateError(false);
          }}
          onBlur={onLabelBlur}
          placeholder={placeholder || nextDefaultRoomLabel()}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
        />
      </label>
      {duplicateError ? (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          이미 있는 이름입니다
        </p>
      ) : null}

      {!sessionId ? (
        <>
          {backendReady === false ? (
            <div
              className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/90 p-3.5 text-sm text-amber-950"
              role="status"
            >
              <p className="font-medium">방 만들기 서버 설정이 필요합니다</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
                로컬에서는 프로젝트 루트의{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">
                  .env.local
                </code>
                에{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>
                와{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>
                를 넣은 뒤 개발 서버를 다시 시작하세요. (Supabase 대시보드 Secret
                키 <code className="mx-0.5 rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">
                  sb_secret_…
                </code>{" "}
                또는 예전 service_role JWT 를{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>
                에 넣으면 됩니다.) 배포 환경에서는 호스팅 설정의 환경 변수에
                동일하게 추가한 뒤 재배포하세요.
              </p>
            </div>
          ) : null}
          <label className="mt-4 block text-sm font-medium text-zinc-700">
            방 비밀번호 (숫자만)
            <input
              type="text"
              name="room-pin"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={roomPassword}
              onChange={(e) => {
                setRoomPassword(e.target.value.replace(/\D/g, ""));
                setPasswordError(null);
              }}
              placeholder="숫자 4자리 이상"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm tabular-nums text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 [-webkit-text-security:disc]"
            />
          </label>
          <label className="mt-3 block text-sm font-medium text-zinc-700">
            비밀번호 확인
            <input
              type="text"
              name="room-pin-confirm"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={roomPasswordConfirm}
              onChange={(e) => {
                setRoomPasswordConfirm(e.target.value.replace(/\D/g, ""));
                setPasswordError(null);
              }}
              placeholder="숫자 한 번 더"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 tabular-nums outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 [-webkit-text-security:disc]"
            />
          </label>
          {passwordError ? (
            <p className="mt-2 text-sm font-medium text-red-600" role="alert">
              {passwordError}
            </p>
          ) : null}
          {backendReady !== false ? (
            <p className="mt-2 text-xs text-zinc-400">
              비밀번호는 서버에 해시로만 저장되며, 평문으로 저장되지 않습니다.
            </p>
          ) : null}
          {/* sticky 헤더 등과 겹칠 때 클릭이 씹히는 경우 완화 */}
          <div className="relative z-[2] mt-4">
            <button
              type="button"
              data-host-room-create
              disabled={createPending}
              onClick={(ev) => {
                console.log("[host-room] 방 만들기 버튼 onClick", {
                  disabled: ev.currentTarget.disabled,
                });
                void createRoom();
              }}
              aria-busy={createPending}
              className={`w-full rounded-xl bg-zinc-800 py-3 text-sm font-medium text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 ${createPending ? "cursor-wait opacity-90" : "cursor-pointer"}`}
            >
              {createPending ? "만드는 중…" : "방 만들기"}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3.5">
            <p className="text-xs font-medium text-zinc-400">참가 링크</p>
            <p className="mt-1 break-all font-mono text-xs text-zinc-800">
              {urls.participate}
            </p>
            <button
              type="button"
              onClick={copyParticipate}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:underline"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "복사됨" : "링크 복사"}
            </button>
          </div>

          <KakaoShareButton
            shareUrl={urls.participate}
            title="Paul Bassett Menu"
            description="아래 링크에서 메뉴를 골라 주세요"
          />

          <Link
            href={urls.board}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-white py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            <Link2 className="h-4 w-4" />
            취합 현황 보기
          </Link>
        </div>
      )}
    </section>
  );
}
