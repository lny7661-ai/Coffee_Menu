"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 카카오 로그인 Redirect URI 가 이 경로로 올 때(전체 페이지 리다이렉트 플로우).
 * 개발자 콘솔에 `https://<도메인>/auth/callback` 등록 후 `Kakao.Auth.login` 의 redirectUri 와 일치시키세요.
 * 팝업 로그인만 쓰면 이 페이지로 오지 않을 수 있습니다.
 */
export default function KakaoAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-100 p-6 text-sm text-zinc-600">
      카카오 로그인 처리 중…
    </div>
  );
}
