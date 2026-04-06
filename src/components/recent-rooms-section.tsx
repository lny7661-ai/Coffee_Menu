"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { RoomStatusBadge } from "@/components/room-status-badge";
import { useSessionClosuresMap } from "@/hooks/useSessionClosure";
import {
  displayHostName,
  getSavedSessions,
  type SavedSession,
} from "@/lib/saved-sessions";

function formatCreated(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RecentRoomsSection() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);

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

  return (
    <section className="relative rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex items-start justify-between gap-2 pr-1">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
          <History className="h-4 w-4 text-zinc-500" strokeWidth={2} />
          최근에 만든 방
        </h2>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-400">
          아직 저장된 방이 없어요. 주최자 화면에서 방을 만들면 여기에
          표시됩니다.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sessions.slice(0, 8).map((s) => {
            const closed = Boolean(closedByRoomId[s.id]);
            return (
              <li key={s.id}>
                <Link
                  href={`/host/session/${s.id}`}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition hover:border-zinc-300 ${
                    closed
                      ? "border-zinc-300 bg-zinc-200/60 hover:bg-zinc-200/80"
                      : "border-zinc-200/80 bg-white hover:bg-zinc-50/80"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="block truncate text-sm font-medium text-zinc-800">
                        {s.label}
                      </span>
                      <RoomStatusBadge closed={closed} />
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                      {`${displayHostName(s.createdBy)} · `}
                      {formatCreated(s.createdAt)}
                    </span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
