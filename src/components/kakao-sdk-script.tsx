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
        const debug =
          process.env.NODE_ENV === "development" ||
          new URLSearchParams(window.location.search).get("debugKakao") === "1";

        const injected = window.__CAFE_KAKAO_JS_KEY__;
        const key = getKakaoJavaScriptKey();
        const Kakao = window.Kakao;

        if (!key) {
          console.warn(
            "[Kakao SDK] JavaScript 키가 없습니다. layout `<head>` 의 window.__CAFE_KAKAO_JS_KEY__ 주입을 확인하세요.",
            {
              layout주입됨:
                typeof injected === "string" && injected.trim().length > 0,
            },
          );
          return;
        }

        if (!Kakao) {
          console.warn(
            "[Kakao SDK] kakao.min.js 로드 후 window.Kakao 가 없습니다. 네트워크·차단 확장 프로그램을 확인하세요.",
          );
          return;
        }

        try {
          if (debug) {
            console.log("[Kakao SDK] onLoad: init 시도 전", {
              hasInjectedKey:
                typeof injected === "string" && injected.trim().length > 0,
              keyMasked: `${key.slice(0, 4)}…${key.slice(-4)}`,
              isInitializedBefore: Kakao.isInitialized(),
            });
          }
          if (!Kakao.isInitialized()) {
            if (debug) {
              // 사용자가 요청한 디버그 출력(마스킹 없이). 문제 해결 후 제거 권장.
              console.log(
                "실제 주입된 키:",
                process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
              );
            }
            Kakao.init(key);
          }
          if (debug) {
            console.log("[Kakao SDK] onLoad: init 후", {
              isInitializedAfter: Kakao.isInitialized(),
            });
          }
        } catch (err) {
          console.error(
            "[Kakao SDK] Kakao.init 실패 — 키 종류(JavaScript 키)·카카오 콘솔 Web 도메인 등록을 확인하세요.",
            err,
          );
          if (debug) {
            console.dir(err);
          }
          return;
        }

        if (Kakao.isInitialized()) {
          if (process.env.NODE_ENV === "development") {
            console.log("[Kakao SDK] 초기화 완료");
          }
          window.dispatchEvent(new Event("kakao-sdk-ready"));
        } else {
          console.warn(
            "[Kakao SDK] init 호출 후에도 isInitialized() 가 false 입니다.",
          );
        }
      }}
    />
  );
}
