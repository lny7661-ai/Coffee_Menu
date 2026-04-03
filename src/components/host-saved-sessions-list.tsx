"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import {
  displayHostName,
  getSavedSessions,
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

  if (sessions.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-5 text-sm text-zinc-500">
        저장된 방이 없습니다. 아래에서 방을 만들면 취합 현황으로 바로 갈 수
        있어요.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-zinc-800">
        <LayoutGrid className="h-5 w-5 text-zinc-500" strokeWidth={2} />
        <h2 className="font-semibold">내 방 · 취합 보기</h2>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        방을 선택하면 전화 주문용으로 묶인 건수 요약을 볼 수 있어요.
      </p>
      <ul className="mt-4 space-y-2">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link
              href={`/host/session/${s.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-3 py-3 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">{s.label}</p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {`${displayHostName(s.createdBy)} · `}
                  {formatCreated(s.createdAt)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
