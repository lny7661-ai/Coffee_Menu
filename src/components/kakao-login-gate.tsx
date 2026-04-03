"use client";

import { MessageCircle } from "lucide-react";
import { loginWithKakao } from "@/lib/kakao/kakao-auth";
import type { KakaoParticipantProfile } from "@/lib/kakao/kakao-auth";
import { getKakaoJavaScriptKey } from "@/lib/kakao/init-kakao-sdk";

type KakaoLoginGateProps = {
  sessionClosed: boolean;
  onLoggedIn: (p: KakaoParticipantProfile) => void;
};

export function KakaoLoginGate({
  sessionClosed,
  onLoggedIn,
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
          로그인하면 본인 메뉴만 안전하게 저장·수정할 수 있어요.
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
      </div>
    </div>
  );
}
