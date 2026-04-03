"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { combineCartLinesForOrder } from "@/lib/menu";

export type CartSubmitLine = {
  menu: string;
  quantity: number;
};

type MenuOrderFormProps = {
  sessionId: string;
  cartLines: CartSubmitLine[];
  canSubmit: boolean;
  /** true면 제출 불가 (취합 마감 등) */
  sessionClosed?: boolean;
  kakaoId: string;
  kakaoNickname: string;
  /** 있으면 UPDATE, 없으면 INSERT */
  existingOrderId: string | null;
  onSubmitted?: () => void;
};

export function MenuOrderForm({
  sessionId,
  cartLines,
  canSubmit,
  sessionClosed = false,
  kakaoId,
  kakaoNickname,
  existingOrderId,
  onSubmitted,
}: MenuOrderFormProps) {
  const queryClient = useQueryClient();
  const isUpdate = Boolean(existingOrderId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isSupabaseConfigured()) {
        throw new Error("Supabase 환경 변수를 .env.local 에 설정해 주세요.");
      }
      const supabase = createBrowserSupabaseClient();
      const name = kakaoNickname.trim();
      if (!name) {
        throw new Error("닉네임을 불러오지 못했습니다. 다시 로그인해 주세요.");
      }
      const menuText = combineCartLinesForOrder(cartLines);
      if (!menuText.trim()) {
        throw new Error("장바구니에 메뉴를 담아 주세요.");
      }

      if (existingOrderId) {
        const { error } = await supabase
          .from("orders")
          .update({
            name,
            menu_item: menuText,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrderId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orders").insert({
          session_id: sessionId,
          room_id: sessionId,
          name,
          menu_item: menuText,
          kakao_id: kakaoId,
        });
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders", sessionId] });
      await queryClient.invalidateQueries({
        queryKey: ["myOrder", sessionId, kakaoId],
      });
      onSubmitted?.();
    },
  });

  const supabaseReady = isSupabaseConfigured();
  const blocked = sessionClosed;

  return (
    <form
      className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (blocked || !canSubmit) return;
        mutation.mutate();
      }}
    >
      <h2 className="text-sm font-semibold text-zinc-900">
        {isUpdate ? "메뉴 수정" : "주문 입력"}
      </h2>
      <p className="mt-1 text-xs text-zinc-400">
        {isUpdate
          ? "장바구니를 수정한 뒤 아래 버튼으로 저장하세요."
          : "카카오 닉네임으로 취합 목록에 반영됩니다."}
      </p>
      {blocked ? (
        <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
          주최자가 취합을 마감했습니다. 더 이상 주문할 수 없습니다.
        </p>
      ) : null}

      {!supabaseReady && (
        <p className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          Supabase 환경 변수를 설정하면 저장됩니다. (.env.local)
        </p>
      )}

      <p className="mt-4 text-sm text-zinc-700">
        <span className="font-medium text-zinc-900">{kakaoNickname}</span>
        <span className="text-zinc-500"> 님으로 저장됩니다</span>
      </p>

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "저장에 실패했습니다."}
        </p>
      )}

      <button
        type="submit"
        disabled={blocked || mutation.isPending || !canSubmit}
        className="mt-5 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending
          ? "저장 중…"
          : isUpdate
            ? "수정 완료"
            : "선택 완료"}
      </button>
    </form>
  );
}
