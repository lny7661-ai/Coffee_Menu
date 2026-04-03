"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Link2, Sparkles } from "lucide-react";
import { KakaoShareButton } from "@/components/kakao-share-button";
import {
  hasDuplicateSessionLabel,
  nextDefaultRoomLabel,
  upsertSavedSession,
  updateSavedSessionLabel,
} from "@/lib/saved-sessions";

export function HostRoomSection() {
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

  useEffect(() => {
    setPlaceholder(nextDefaultRoomLabel());
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
    const createdBy = hostName.trim() || "익명";

    const pw = roomPassword.trim();
    const pw2 = roomPasswordConfirm.trim();
    if (pw.length < 4) {
      setPasswordError("비밀번호는 4자 이상으로 설정해 주세요.");
      return;
    }
    if (pw !== pw2) {
      setPasswordError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setPasswordError(null);

    const label = roomLabel.trim() || nextDefaultRoomLabel();
    if (hasDuplicateSessionLabel(label)) {
      setDuplicateError(true);
      return;
    }
    setDuplicateError(false);

    setCreatePending(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_name: label, password: pw }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
      };
      if (!res.ok) {
        setPasswordError(body.error ?? "방을 만들지 못했습니다.");
        return;
      }
      const id = body.id;
      if (!id) {
        setPasswordError("응답에 방 ID 가 없습니다.");
        return;
      }

      const createdAt = new Date().toISOString();
      upsertSavedSession({
        id,
        label,
        createdAt,
        createdBy,
      });
      setSessionId(id);
      setRoomLabel(label);
      setRoomPassword("");
      setRoomPasswordConfirm("");
      setCopied(false);
      window.dispatchEvent(new Event("saved-sessions-changed"));
    } catch {
      setPasswordError("네트워크 오류로 방을 만들지 못했습니다.");
    } finally {
      setCreatePending(false);
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
          <p className="mt-2 text-xs text-zinc-400">
            서버에 해시로만 저장됩니다.{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px]">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            가 필요합니다.
          </p>
          <button
            type="button"
            onClick={() => void createRoom()}
            disabled={createPending}
            className="mt-4 w-full rounded-xl bg-zinc-800 py-3 text-sm font-medium text-white transition hover:bg-zinc-900 disabled:opacity-60"
          >
            {createPending ? "만드는 중…" : "방 만들기"}
          </button>
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
