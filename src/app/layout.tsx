import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { MobileShell } from "@/components/mobile-shell";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "커피 메뉴 취합",
  description:
    "모바일에서 카카오톡으로 공유하고, 참가자 메뉴를 한눈에 모으는 커피 메뉴 취합 앱",
  appleWebApp: {
    capable: true,
    title: "커피 메뉴 취합",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-dvh bg-stone-200/60 font-sans text-stone-900">
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="afterInteractive"
        />
        <Providers>
          <MobileShell>{children}</MobileShell>
        </Providers>
      </body>
    </html>
  );
}
