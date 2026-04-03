"use client";

import Script from "next/script";
import { getKakaoJavaScriptKey } from "@/lib/kakao/init-kakao-sdk";

const KAKAO_SDK_SRC =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

/**
 * `kakao.min.js` 로드 직후 `Kakao.init` — 폴링 레이스 없이 공유 버튼을 바로 쓸 수 있게 함.
 */
export function KakaoSdkScript() {
  return (
    <Script
      src={KAKAO_SDK_SRC}
      strategy="afterInteractive"
      onLoad={() => {
        const key = getKakaoJavaScriptKey();
        const Kakao = window.Kakao;
        if (!key || !Kakao) return;
        try {
          if (!Kakao.isInitialized()) {
            Kakao.init(key);
          }
        } catch {
          /* 잘못된 키·도메인 미등록 등 */
        }
        if (Kakao.isInitialized()) {
          window.dispatchEvent(new Event("kakao-sdk-ready"));
        }
      }}
    />
  );
}
