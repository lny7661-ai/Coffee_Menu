"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { loginWithKakao } from "@/lib/kakao/kakao-auth";
import type { KakaoParticipantProfile } from "@/lib/kakao/kakao-auth";
import { getKakaoJavaScriptKey } from "@/lib/kakao/init-kakao-sdk";
import { ensureKakaoReadyForLogin } from "@/lib/kakao/init-kakao-sdk";

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
  const debug =
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debugKakao") === "1");

  useEffect(() => {
    console.log("Login Page Mounted");
  }, []);

  const handleTestDirectAuthLogin = async () => {
    try {
      console.log("[Kakao TEST] origin:", window.location.origin);
      // 요청대로 redirectUri 를 현재 origin 기준으로 강제(예: http://localhost:3000/auth/callback)
      const redirectUri = `${window.location.origin.replace(/\/$/, "")}/auth/callback`;
      console.log("[Kakao TEST] redirectUri:", redirectUri);

      await ensureKakaoReadyForLogin();
      const Kakao = window.Kakao;
      console.log("Kakao Auth 객체 상태:", Kakao?.Auth);

      if (!Kakao?.Auth?.authorize) {
        window.alert("window.Kakao.Auth.authorize 를 찾지 못했습니다.");
        return;
      }

      Kakao.Auth.authorize({
        scope: "profile_nickname",
        redirectUri,
      });
      window.alert(
        "Kakao.Auth.authorize 호출 완료 — 이제 redirectUri로 이동하는지/팝업의 에러가 무엇인지 확인하세요.",
      );
    } catch (e) {
      console.error("[Kakao TEST] 예외:", e);
      window.alert(
        e instanceof Error ? e.message : "카카오 테스트 로그인 중 오류가 발생했습니다.",
      );
    }
  };

  const handleLogin = async () => {
    // 임시 클릭 이벤트 확인용: URL에 ?debugClick=1 이 있으면 alert만 띄우고 로그인 실행은 막음
    if (typeof window !== "undefined") {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get("debugClick") === "1") {
        window.alert("버튼 작동 확인");
        return;
      }
    }

    try {
      // 카카오 콘솔에 등록된 도메인과 1:1 일치해야 함(토씨 하나 포함)
      console.log("현재 브라우저 origin:", window.location.origin);
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
            window.__CAFE_KAKAO_JS_KEY__(Vercel NEXT_PUBLIC_KAKAO_JS_KEY)가 필요합니다.
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
        {debug ? (
          <button
            type="button"
            onClick={handleTestDirectAuthLogin}
            className="mt-3 w-full rounded-xl border-2 border-red-300 bg-white py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
          >
            (테스트) Kakao.Auth.authorize 직접 호출
          </button>
        ) : null}
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
