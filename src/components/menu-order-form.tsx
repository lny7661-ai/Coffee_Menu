"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type MenuOrderFormProps = {
  sessionId: string;
  /** Supabase orders.menu 에 저장되는 한 줄 */
  orderLine: string;
  canSubmit: boolean;
  onSubmitted?: () => void;
};

export function MenuOrderForm({
  sessionId,
  orderLine,
  canSubmit,
  onSubmitted,
}: MenuOrderFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase 환경 변수를 .env.local 에 설정해 주세요.");
      }
      const supabase = createBrowserSupabaseClient();
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("이름을 입력해 주세요.");
      }
      if (!orderLine.trim()) {
        throw new Error("메뉴를 선택해 주세요.");
      }
      const { error } = await supabase.from("orders").insert({
        name: trimmedName,
        menu: orderLine.trim(),
        session_id: sessionId,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders", sessionId] });
      onSubmitted?.();
    },
  });

  const supabaseReady = isSupabaseConfigured();

  return (
    <form
      className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit || !name.trim()) return;
        mutation.mutate();
      }}
    >
      <h2 className="text-sm font-semibold text-zinc-900">주문 입력</h2>
      <p className="mt-1 text-xs text-zinc-400">
        이름을 입력하고 선택 완료를 누르면 취합 목록에 반영됩니다.
      </p>

      {!supabaseReady && (
        <p className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          Supabase 환경 변수를 설정하면 저장됩니다. (.env.local)
        </p>
      )}

      <label className="mt-4 block text-sm font-medium text-zinc-700">
        이름
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-zinc-900/5 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
          autoComplete="name"
        />
      </label>

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "저장에 실패했습니다."}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !canSubmit || !name.trim()}
        className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "저장 중…" : "선택 완료"}
      </button>
    </form>
  );
}
