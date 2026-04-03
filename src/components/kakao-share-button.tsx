"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  getKakaoJavaScriptKey,
  initKakaoSdkWhenReady,
} from "@/lib/kakao/init-kakao-sdk";

const PLACEHOLDER_IMAGE =
  "https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png";

type KakaoShareButtonProps = {
  /** 공유할 링크. 없으면 현재 탭 URL */
  shareUrl?: string;
  title?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
};

export function KakaoShareButton({
  shareUrl,
  title = "커피 메뉴 취합",
  description = "메뉴를 골라 주세요",
  className = "",
  disabled = false,
}: KakaoShareButtonProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markReadyIfKakao = () => {
      if (cancelled) return;
      if (window.Kakao?.isInitialized()) setReady(true);
    };

    markReadyIfKakao();
    window.addEventListener("kakao-sdk-ready", markReadyIfKakao);

    void (async () => {
      const ok = await initKakaoSdkWhenReady();
      if (!cancelled && ok) setReady(true);
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("kakao-sdk-ready", markReadyIfKakao);
    };
  }, []);

  const handleShare = useCallback(() => {
    if (typeof window === "undefined" || !window.Kakao?.Share) return;
    const url =
      shareUrl?.trim() ||
      `${window.location.origin}${window.location.pathname}${window.location.search}`;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: PLACEHOLDER_IMAGE,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
      buttons: [
        {
          title: "메뉴 고르기",
          link: {
            mobileWebUrl: url,
            webUrl: url,
          },
        },
      ],
    });
  }, [shareUrl, title, description]);

  const hasKey = Boolean(getKakaoJavaScriptKey());

  return (
    <div className="space-y-2">
      {!hasKey && (
        <p className="text-xs text-zinc-500">
          NEXT_PUBLIC_KAKAO_JS_KEY 를 설정하면 공유할 수 있어요.
        </p>
      )}
      <button
        type="button"
        onClick={handleShare}
        disabled={disabled || !ready || !hasKey}
        className={`w-full rounded-xl bg-[#FEE500] py-3 text-sm font-semibold text-[#3C1E1E] transition hover:bg-[#FDD835] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <MessageCircle className="h-5 w-5" />
          카카오톡으로 보내기
        </span>
      </button>
    </div>
  );
}
