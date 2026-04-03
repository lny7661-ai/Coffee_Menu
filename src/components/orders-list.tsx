"use client";

import { useOrders } from "@/hooks/useOrders";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type OrdersListProps = {
  sessionId: string;
};

function formatTime(iso: string) {
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

export function OrdersList({ sessionId }: OrdersListProps) {
  const { data, isLoading, isError, error } = useOrders(sessionId);
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/90 px-4 py-3 text-sm text-zinc-600">
        Supabase URL·anon 키를 설정하면 실시간 목록이 표시됩니다.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-zinc-400" aria-live="polite">
        불러오는 중…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error instanceof Error ? error.message : "목록을 불러오지 못했습니다."}
      </p>
    );
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200/90 bg-white px-4 py-6 text-center text-sm text-zinc-400">
        아직 주문이 없습니다. 참가자에게 링크를 공유해 보세요.
      </p>
    );
  }

  return (
    <ul className="space-y-2 rounded-2xl border border-zinc-200/90 bg-white p-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-col gap-1 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          <div>
            <p className="font-semibold text-zinc-900">{row.name}</p>
            <p className="mt-0.5 text-zinc-600">{row.menu}</p>
          </div>
          <time
            className="shrink-0 text-xs text-zinc-400"
            dateTime={row.created_at}
          >
            {formatTime(row.created_at)}
          </time>
        </li>
      ))}
    </ul>
  );
}
