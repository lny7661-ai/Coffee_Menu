"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { buildMenuLabel } from "@/lib/menu";
import type { MenuItem } from "@/lib/types";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type MenuOrderFormProps = {
  sessionId: string;
  menus: MenuItem[];
  onSubmitted?: () => void;
};

export function MenuOrderForm({ sessionId, menus, onSubmitted }: MenuOrderFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string | "other">(menus[0]?.id ?? "other");
  const [otherDetail, setOtherDetail] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase 환경 변수를 .env.local 에 설정해 주세요.");
      }
      const supabase = createBrowserSupabaseClient();
      const menuLabel = buildMenuLabel(menus, selected, otherDetail);
      const trimmedName = name.trim();
      if (!trimmedName) {
        throw new Error("이름을 입력해 주세요.");
      }
      if (selected === "other" && !otherDetail.trim()) {
        throw new Error("기타 메뉴 내용을 입력해 주세요.");
      }
      const { error } = await supabase.from("orders").insert({
        name: trimmedName,
        menu: menuLabel,
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
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <h2 className="text-sm font-semibold text-stone-900">주문 입력</h2>
      <p className="mt-1 text-xs text-stone-500">
        이름과 메뉴를 선택하면 취합 목록에 반영됩니다.
      </p>

      {!supabaseReady && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Supabase 환경 변수를 설정하면 저장됩니다. (.env.local)
        </p>
      )}

      <label className="mt-4 block text-sm font-medium text-stone-700">
        이름
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-stone-900 outline-none ring-amber-500/30 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
          autoComplete="name"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-stone-700">
        메뉴
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as string | "other")}
          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
        >
          {menus.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.temperature === "ice" ? "아이스" : "핫"} ·{" "}
              {m.milkOption === "regular"
                ? "일반우유"
                : m.milkOption === "soy"
                  ? "두유"
                  : "오트밀크"}
              )
            </option>
          ))}
          <option value="other">기타</option>
        </select>
      </label>

      {selected === "other" && (
        <label className="mt-4 block text-sm font-medium text-stone-700">
          기타 메뉴
          <input
            type="text"
            value={otherDetail}
            onChange={(e) => setOtherDetail(e.target.value)}
            placeholder="원하는 메뉴를 적어 주세요"
            className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-stone-900 outline-none placeholder:text-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
          />
        </label>
      )}

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "저장에 실패했습니다."}
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "저장 중…" : "선택 완료"}
      </button>
    </form>
  );
}
