"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Eye, Lock } from "lucide-react";
import * as XLSX from "xlsx";
import { HostSessionCloseButton } from "@/components/host-session-close-button";
import type { OrderRow } from "@/lib/types";
import type { MenuStatLine } from "@/lib/order-stats";

type RoomStatsPayload = {
  lines: MenuStatLine[];
  sentence: string;
};

type HostOrdersPayload = {
  orders: OrderRow[];
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

export function HostRoomDashboard({ roomId }: { roomId: string }) {
  const queryClient = useQueryClient();
  const [pwOpen, setPwOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ["roomStats", roomId],
    queryFn: async (): Promise<RoomStatsPayload> => {
      const r = await fetch(`/api/rooms/${roomId}/stats`);
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "통계를 불러오지 못했습니다.");
      }
      return r.json() as Promise<RoomStatsPayload>;
    },
    refetchInterval: 8000,
  });

  const hostOrdersQuery = useQuery({
    queryKey: ["hostOrders", roomId],
    queryFn: async (): Promise<HostOrdersPayload | "unauthorized"> => {
      const r = await fetch(`/api/rooms/${roomId}/host-orders`, {
        credentials: "include",
      });
      if (r.status === 401) return "unauthorized";
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "목록을 불러오지 못했습니다.");
      }
      return r.json() as Promise<HostOrdersPayload>;
    },
    retry: false,
    refetchInterval: 8000,
  });

  const loginMutation = useMutation({
    mutationFn: async (pw: string) => {
      const r = await fetch(`/api/rooms/${roomId}/host-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: pw }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? "로그인에 실패했습니다.");
    },
    onSuccess: async () => {
      setPwOpen(false);
      setPassword("");
      setPwError(null);
      await queryClient.invalidateQueries({ queryKey: ["hostOrders", roomId] });
    },
    onError: (e: Error) => {
      setPwError(e.message);
    },
  });

  const isHost =
    hostOrdersQuery.data &&
    hostOrdersQuery.data !== "unauthorized" &&
    !hostOrdersQuery.isError;

  const orders: OrderRow[] =
    isHost && hostOrdersQuery.data !== "unauthorized"
      ? hostOrdersQuery.data.orders
      : [];

  const downloadXlsx = () => {
    if (orders.length === 0) return;
    const sheet = XLSX.utils.json_to_sheet(
      orders.map((row) => ({
        이름: row.name,
        메뉴: row.menu_item,
        주문시각: row.created_at,
        카카오ID: row.kakao_id ?? "",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "주문");
    XLSX.writeFile(wb, `cafe-orders-${roomId.slice(0, 8)}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {statsQuery.isLoading ? (
        <p className="text-sm text-zinc-400" aria-live="polite">
          통계를 불러오는 중…
        </p>
      ) : statsQuery.isError ? (
        <p className="text-sm text-red-600" role="alert">
          {statsQuery.error instanceof Error
            ? statsQuery.error.message
            : "통계를 불러오지 못했습니다."}
        </p>
      ) : (
        <section className="rounded-2xl border border-zinc-800/20 bg-zinc-800 px-4 py-4 text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            메뉴별 주문 수
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-100">
            {statsQuery.data?.sentence ?? ""}
          </p>
          {statsQuery.data?.lines && statsQuery.data.lines.length > 0 ? (
            <ul className="mt-4 space-y-2 border-t border-zinc-700/80 pt-4 text-sm">
              {statsQuery.data.lines.map(({ label, count }) => (
                <li
                  key={label}
                  className="flex justify-between gap-2 border-b border-zinc-700/50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="min-w-0 text-zinc-100">{label}</span>
                  <span className="shrink-0 tabular-nums text-zinc-300">
                    {count}잔
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      {!isHost ? (
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">상세 내역은 방장만 볼 수 있습니다.</p>
          <p className="mt-1 text-xs text-amber-900/80">
            이름·메뉴가 적힌 전체 명단은 방 비밀번호를 입력한 뒤에만 표시됩니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setPwOpen(true);
              setPwError(null);
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <Lock className="h-4 w-4" strokeWidth={2} />
            방장 로그인 (비밀번호 입력)
          </button>
        </div>
      ) : null}

      {pwOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="host-pw-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
            <h2 id="host-pw-title" className="text-base font-semibold text-zinc-900">
              방 비밀번호
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              방을 만들 때 설정한 비밀번호를 입력하세요.
            </p>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loginMutation.mutate(password);
              }}
              className="mt-4 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="비밀번호"
            />
            {pwError ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {pwError}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPwOpen(false);
                  setPassword("");
                  setPwError(null);
                }}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700"
              >
                취소
              </button>
              <button
                type="button"
                disabled={loginMutation.isPending || !password.trim()}
                onClick={() => loginMutation.mutate(password)}
                className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loginMutation.isPending ? "확인 중…" : "확인"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isHost ? (
        <>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <Eye className="h-4 w-4" strokeWidth={2} />
            방장 보기 — 전체 명단
          </div>

          {hostOrdersQuery.isLoading ? (
            <p className="text-sm text-zinc-400">명단을 불러오는 중…</p>
          ) : orders.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/90 bg-white px-4 py-6 text-center text-sm text-zinc-400">
              아직 주문이 없습니다.
            </p>
          ) : (
            <ul className="space-y-2 rounded-2xl border border-zinc-200/90 bg-white p-3 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {orders.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-1 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{row.name}</p>
                    <p className="mt-0.5 whitespace-pre-wrap text-zinc-600">
                      {row.menu_item}
                    </p>
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
          )}

          <button
            type="button"
            onClick={downloadXlsx}
            disabled={orders.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" strokeWidth={2} />
            엑셀로 내보내기 (.xlsx)
          </button>

          <HostSessionCloseButton sessionId={roomId} />
        </>
      ) : null}
    </div>
  );
}
