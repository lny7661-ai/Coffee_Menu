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
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 text-zinc-800">
        <Sparkles className="h-5 w-5 text-zinc-500" strokeWidth={2} />
        <h2 className="font-semibold">방 만들기 · 링크 공유</h2>
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        방을 만들면 참가자용 링크가 생깁니다. 카카오톡으로 그 링크를 보낼 수
        있어요.
      </p>

      {!sessionId ? (
        <button
          type="button"
          onClick={createRoom}
          className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          방 만들기
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3.5">
            <p className="text-xs font-medium text-zinc-400">참가 링크</p>
            <p className="mt-1 break-all font-mono text-xs text-zinc-800">
              {urls.participate}
            </p>
            <button
              type="button"
              onClick={copyParticipate}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:underline"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/90 bg-white py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            <Link2 className="h-4 w-4" />
            취합 현황 보기
          </Link>
        </div>
      )}
    </section>
  );
}
