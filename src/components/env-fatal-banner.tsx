"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  /** 서버(readPublic*) 기준 — NEXT_PUBLIC_KAKAO_JS_KEY */
  serverKakaoOk: boolean;
  serverSupabaseUrlOk: boolean;
  serverSupabaseAnonOk: boolean;
};

function trim(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * 배포 디버그: `window.__CAFE_*` / 카카오 키 누락 시 상단 빨간 배너(무조건 클라이언트에서도 검사).
 */
export function EnvFatalBanner({
  serverKakaoOk,
  serverSupabaseUrlOk,
  serverSupabaseAnonOk,
}: Props) {
  const [clientLines, setClientLines] = useState<string[]>([]);

  const serverLines = useMemo(() => {
    const out: string[] = [];
    if (!serverKakaoOk) {
      out.push(
        "[서버] NEXT_PUBLIC_KAKAO_JS_KEY 없음 — 카카오 로그인·공유 불가. Vercel 환경 변수를 확인하세요.",
      );
    }
    if (!serverSupabaseUrlOk) {
      out.push(
        "[서버] NEXT_PUBLIC_SUPABASE_URL 없음 — DB 연결 불가. Vercel에 동일 프로젝트 URL만 설정하세요.",
      );
    }
    if (!serverSupabaseAnonOk) {
      out.push(
        "[서버] NEXT_PUBLIC_SUPABASE_ANON_KEY 없음 — No API key / 방장 수정 실패. Vercel anon 키를 설정하세요.",
      );
    }
    return out;
  }, [serverKakaoOk, serverSupabaseUrlOk, serverSupabaseAnonOk]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next: string[] = [];

    if (!trim(window.__CAFE_SUPABASE_URL__)) {
      next.push(
        "[클라이언트] window.__CAFE_SUPABASE_URL__ 없음 — layout `<head>` 주입 실패 또는 스크립트 차단.",
      );
    }
    if (!trim(window.__CAFE_SUPABASE_ANON_KEY__)) {
      next.push(
        "[클라이언트] window.__CAFE_SUPABASE_ANON_KEY__ 없음 — layout `<head>` 주입 실패 또는 스크립트 차단.",
      );
    }
    if (!trim(window.__CAFE_KAKAO_JS_KEY__)) {
      next.push(
        "[클라이언트] window.__CAFE_KAKAO_JS_KEY__ 없음 — 카카오 키 head 주입 실패.",
      );
    }

    setClientLines(next);
  }, []);

  const all = [...serverLines, ...clientLines];
  if (all.length === 0) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[9999] border-b-4 border-red-700 bg-red-600 px-4 py-6 text-center text-red-50 shadow-xl"
    >
      <p className="text-2xl font-black tracking-tight sm:text-4xl md:text-5xl">
        환경 변수 오류 (임시 디버그)
      </p>
      <ul className="mx-auto mt-4 max-w-4xl list-inside list-disc space-y-2 text-left text-lg font-bold sm:text-xl md:text-2xl">
        {all.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
