"use client";

import { MessageCircle } from "lucide-react";
import { loginWithKakao } from "@/lib/kakao/kakao-auth";
import type { KakaoParticipantProfile } from "@/lib/kakao/kakao-auth";
import { getKakaoJavaScriptKey } from "@/lib/kakao/init-kakao-sdk";

type KakaoLoginGateProps = {
  sessionClosed: boolean;
  onLoggedIn: (p: KakaoParticipantProfile) => void;
  /** 카카오 없이 메뉴·장바구니만 확인 (주문 저장은 불가 — 로그인 후 가능) */
  onBrowseWithoutLogin?: () => void;
};

export function KakaoLoginGate({
  sessionClosed,
  onLoggedIn,
  onBrowseWithoutLogin,
}: KakaoLoginGateProps) {
  const hasKey = Boolean(getKakaoJavaScriptKey());

  const handleLogin = async () => {
    try {
      const p = await loginWithKakao();
      onLoggedIn(p);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "카카오 로그인에 실패했습니다.",
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-8">
      {sessionClosed ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700">
          이 방은 취합이 마감되었습니다.
        </p>
      ) : null}

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE500]/30 text-[#3C1E1E]">
          <MessageCircle className="h-6 w-6" strokeWidth={2} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900">
          카카오로 시작하기
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          참가해 주문하려면 카카오 로그인이 필요해요. 메뉴만 둘러보려면 아래에서
          로그인 없이 들어갈 수 있어요.
        </p>
        {!hasKey ? (
          <p className="mt-4 text-xs text-amber-700">
            NEXT_PUBLIC_KAKAO_JS_KEY 가 필요합니다.
          </p>
        ) : (
          <button
            type="button"
            disabled={sessionClosed}
            onClick={handleLogin}
            className="mt-6 w-full rounded-xl bg-[#FEE500] py-3.5 text-sm font-semibold text-[#3C1E1E] transition hover:bg-[#FDD835] disabled:cursor-not-allowed disabled:opacity-50"
          >
            카카오로 로그인하고 시작하기
          </button>
        )}
        {onBrowseWithoutLogin ? (
          <button
            type="button"
            disabled={sessionClosed}
            onClick={onBrowseWithoutLogin}
            className="mt-3 w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            카카오 없이 메뉴만 보기
          </button>
        ) : null}
        {onBrowseWithoutLogin ? (
          <p className="mt-2 text-center text-xs text-zinc-400">
            이 모드에서는 장바구니는 쓸 수 있어도 주문 저장은 되지 않아요. 저장하려면
            위에서 카카오 로그인을 해 주세요.
          </p>
        ) : null}
      </div>
    </div>
  );
}
