"use client";

import { Lock } from "lucide-react";
import { useCafeSupabaseConfigured } from "@/lib/cafe/cafe-runtime-context";
import {
  useCloseSessionMutation,
  useSessionClosure,
} from "@/hooks/useSessionClosure";

type HostSessionCloseButtonProps = {
  sessionId: string;
};

export function HostSessionCloseButton({ sessionId }: HostSessionCloseButtonProps) {
  const { data: closedAt, isLoading } = useSessionClosure(sessionId);
  const mutation = useCloseSessionMutation(sessionId);
  const configured = useCafeSupabaseConfigured();

  if (!configured) {
    return (
      <p className="rounded-xl border border-amber-100 bg-amber-50/90 px-3 py-2 text-xs text-amber-900">
        취합 마감은 Supabase에 session_closures 테이블이 있을 때 동작합니다.
        <code className="mt-1 block font-mono text-[10px] text-amber-800">
          supabase/migrations/002_session_closures.sql
        </code>
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="text-xs text-zinc-400" aria-live="polite">
        마감 상태 확인 중…
      </p>
    );
  }

  if (closedAt) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600">
        <Lock className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} />
        <span>이 방은 취합이 마감되었습니다. 참가자는 더 이상 주문할 수 없어요.</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-sm font-medium text-zinc-800">취합 마감</p>
      <p className="mt-1 text-xs text-zinc-500">
        마감하면 참가자 화면에서 신규 주문이 막힙니다. 이미 들어온 주문은 그대로
        보입니다.
      </p>
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => {
          if (
            !window.confirm(
              "취합을 마감할까요? 참가자는 더 이상 주문을 제출할 수 없습니다.",
            )
          ) {
            return;
          }
          mutation.mutate();
        }}
        className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50"
      >
        {mutation.isPending ? "처리 중…" : "취합 마감하기"}
      </button>
      {mutation.isError ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "마감에 실패했습니다."}
        </p>
      ) : null}
    </div>
  );
}
