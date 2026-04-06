import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileShell } from "@/components/mobile-shell";
import { Providers } from "@/app/providers";
import { EnvFatalBanner } from "@/components/env-fatal-banner";
import { KakaoSdkScript } from "@/components/kakao-sdk-script";
import { CafeRuntimeProvider } from "@/lib/cafe/cafe-runtime-context";
import { readPublicKakaoJavaScriptKey } from "@/lib/server/read-public-kakao-key";
import { readPublicSupabaseBrowserConfig } from "@/lib/server/read-public-supabase-config";

export const metadata: Metadata = {
  title: "Paul Bassett Menu",
  description:
    "한화토탈에너지스 대산공장점 · 모바일에서 카카오톡으로 공유하고 참가자 메뉴를 한눈에 모으는 메뉴 취합",
  appleWebApp: {
    capable: true,
    title: "Paul Bassett Menu",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kakaoJsKey = readPublicKakaoJavaScriptKey();
  const supabasePublic = readPublicSupabaseBrowserConfig();
  const supabaseBrowserReady = Boolean(
    supabasePublic.url && supabasePublic.anonKey,
  );
  const serverKakaoOk = Boolean(kakaoJsKey);
  const serverSupabaseUrlOk = Boolean(supabasePublic.url);
  const serverSupabaseAnonOk = Boolean(supabasePublic.anonKey);

  if (!serverKakaoOk) {
    console.error(
      "[layout] NEXT_PUBLIC_KAKAO_JS_KEY 없음 — 카카오 로그인·공유 불가",
    );
  }
  if (!serverSupabaseUrlOk || !serverSupabaseAnonOk) {
    console.error(
      "[layout] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 없음 — 브라우저 DB·API 키 오류",
    );
  }

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {supabaseBrowserReady ? (
          <script
            // hydration 전 실행: 브라우저 Supabase는 process.env 대신 이 값만 사용
            dangerouslySetInnerHTML={{
              __html: `window.__CAFE_SUPABASE_URL__=${JSON.stringify(supabasePublic.url)};window.__CAFE_SUPABASE_ANON_KEY__=${JSON.stringify(supabasePublic.anonKey)};`,
            }}
          />
        ) : null}
        {kakaoJsKey ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__CAFE_KAKAO_JS_KEY__=${JSON.stringify(kakaoJsKey)};`,
            }}
          />
        ) : null}
      </head>
      <body
        className="min-h-dvh bg-zinc-100 font-sans text-zinc-900"
        data-cafe-supabase={supabaseBrowserReady ? "configured" : "missing"}
      >
        <EnvFatalBanner
          serverKakaoOk={serverKakaoOk}
          serverSupabaseUrlOk={serverSupabaseUrlOk}
          serverSupabaseAnonOk={serverSupabaseAnonOk}
        />
        <KakaoSdkScript />
        <CafeRuntimeProvider supabaseConfigured={supabaseBrowserReady}>
          <Providers>
            <MobileShell>{children}</MobileShell>
          </Providers>
        </CafeRuntimeProvider>
      </body>
    </html>
  );
}
