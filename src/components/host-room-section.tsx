"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Link2, Sparkles } from "lucide-react";
import { KakaoShareButton } from "@/components/kakao-share-button";

export function HostRoomSection() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const urls = useMemo(() => {
    if (typeof window === "undefined" || !sessionId) {
      return { participate: "", board: "" };
    }
    const origin = window.location.origin;
    return {
      participate: `${origin}/order/${sessionId}`,
      board: `${origin}/host/session/${sessionId}`,
    };
  }, [sessionId]);

  const createRoom = useCallback(() => {
    setSessionId(crypto.randomUUID());
    setCopied(false);
  }, []);

  const copyParticipate = useCallback(async () => {
    if (!urls.participate || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(urls.participate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [urls.participate]);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-stone-800">
        <Sparkles className="h-5 w-5 text-amber-700" />
        <h2 className="font-semibold">방 만들기 · 링크 공유</h2>
      </div>
      <p className="mt-2 text-sm text-stone-600">
        방을 만들면 참가자용 링크가 생깁니다. 카카오톡으로 그 링크를 보낼 수
        있어요.
      </p>

      {!sessionId ? (
        <button
          type="button"
          onClick={createRoom}
          className="mt-4 w-full rounded-xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          방 만들기
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3">
            <p className="text-xs font-medium text-stone-500">참가 링크</p>
            <p className="mt-1 break-all font-mono text-xs text-stone-800">
              {urls.participate}
            </p>
            <button
              type="button"
              onClick={copyParticipate}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:underline"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "복사됨" : "링크 복사"}
            </button>
          </div>

          <KakaoShareButton
            shareUrl={urls.participate}
            title="커피 메뉴 취합"
            description="아래 링크에서 메뉴를 골라 주세요"
          />

          <Link
            href={urls.board}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
          >
            <Link2 className="h-4 w-4" />
            취합 현황 보기
          </Link>
        </div>
      )}
    </section>
  );
}
