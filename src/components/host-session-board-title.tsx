"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { displayHostName, getSavedSession } from "@/lib/saved-sessions";

export function HostSessionBoardTitle({ sessionId }: { sessionId: string }) {
  const [label, setLabel] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<string | null>(null);

  useEffect(() => {
    const s = getSavedSession(sessionId);
    setLabel(s?.label ?? null);
    setCreatedBy(s ? displayHostName(s.createdBy) : null);
  }, [sessionId]);

  const metaQuery = useQuery({
    queryKey: ["roomMeta", sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/rooms/${sessionId}/meta`);
      if (!r.ok) return null;
      const j = (await r.json()) as { room_name?: string };
      return j.room_name ?? null;
    },
    staleTime: 60_000,
  });

  const title =
    label?.trim() ||
    metaQuery.data?.trim() ||
    "참가 메뉴";

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
        취합 현황
      </p>
      <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      {createdBy ? (
        <p className="mt-0.5 text-xs text-zinc-500">주최 {createdBy}</p>
      ) : null}
      {label || metaQuery.data ? (
        <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">
          {sessionId}
        </p>
      ) : null}
    </div>
  );
}
