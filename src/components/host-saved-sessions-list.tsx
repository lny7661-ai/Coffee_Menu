"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { RoomStatusBadge } from "@/components/room-status-badge";
import { useSessionClosuresMap } from "@/hooks/useSessionClosure";
import {
  displayHostName,
  getSavedSessions,
  removeSavedSession,
  type SavedSession,
} from "@/lib/saved-sessions";

function formatCreated(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function HostSavedSessionsList() {
  const queryClient = useQueryClient();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SavedSession | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const refresh = useCallback(() => {
    setSessions(getSavedSessions());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cafe_menu_saved_sessions_v1" || e.key === null) {
        refresh();
      }
    };
    const onCustom = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("saved-sessions-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("saved-sessions-changed", onCustom);
    };
  }, [refresh]);

  const ids = sessions.map((s) => s.id);
  const { closedByRoomId } = useSessionClosuresMap(ids);

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeletePassword("");
    setDeleteError(null);
    setDeletePending(false);
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    const pw = deletePassword.trim();
    if (!pw) {
      setDeleteError("비밀번호를 입력해 주세요.");
      return;
    }
    setDeleteError(null);
    setDeletePending(true);
    try {
      const res = await fetch(`/api/rooms/${deleteTarget.id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDeleteError(body.error ?? "삭제에 실패했습니다.");
        return;
      }
      removeSavedSession(deleteTarget.id);
      void queryClient.invalidateQueries({
        queryKey: ["sessionClosure", deleteTarget.id],
      });
      window.dispatchEvent(new Event("saved-sessions-changed"));
      closeDeleteModal();
    } catch {
      setDeleteError("네트워크 오류로 삭제하지 못했습니다.");
    } finally {
      setDeletePending(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-5 text-sm text-zinc-500">
        저장된 방이 없습니다. 아래에서 방을 만들면 취합 현황으로 바로 갈 수
        있어요.
      </section>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 text-zinc-800">
          <LayoutGrid className="h-5 w-5 text-zinc-500" strokeWidth={2} />
          <h2 className="font-semibold">내 방 · 취합 보기</h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          방을 선택하면 전화 주문용으로 묶인 건수 요약을 볼 수 있어요. 삭제는
          방 비밀번호 확인 후에만 가능합니다.
        </p>
        <ul className="mt-4 space-y-2">
          {sessions.map((s) => {
            const closed = Boolean(closedByRoomId[s.id]);
            return (
              <li key={s.id} className="flex gap-2">
                <Link
                  href={`/host/session/${s.id}`}
                  className={`flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border px-3 py-3 transition hover:border-zinc-300 ${
                    closed
                      ? "border-zinc-300 bg-zinc-200/50 hover:bg-zinc-200/70"
                      : "border-zinc-200/90 bg-zinc-50/50 hover:bg-zinc-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-zinc-900">
                        {s.label}
                      </span>
                      <RoomStatusBadge closed={closed} />
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {`${displayHostName(s.createdBy)} · `}
                      {formatCreated(s.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
                </Link>
                <button
                  type="button"
                  aria-label={`${s.label} 방 삭제`}
                  onClick={() => {
                    setDeleteTarget(s);
                    setDeletePassword("");
                    setDeleteError(null);
                  }}
                  className="flex h-[52px] w-11 shrink-0 items-center justify-center rounded-xl border border-red-200/90 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-room-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-room-title"
              className="text-base font-semibold text-zinc-900"
            >
              방 삭제
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">
                {deleteTarget.label}
              </span>
              방과 관련 주문·마감 데이터가 모두 삭제됩니다. 이 작업은 되돌릴 수
              없어요.
            </p>
            <label className="mt-4 block text-sm font-medium text-zinc-700">
              방 비밀번호 (숫자)
              <input
                type="text"
                name="delete-room-pin"
                inputMode="numeric"
                autoComplete="off"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value.replace(/\D/g, ""));
                  setDeleteError(null);
                }}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm tabular-nums text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 [-webkit-text-security:disc]"
                placeholder="방 만들 때 설정한 비밀번호"
              />
            </label>
            {deleteError ? (
              <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletePending}
                className="flex-1 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void submitDelete()}
                disabled={deletePending}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletePending ? "삭제 중…" : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
