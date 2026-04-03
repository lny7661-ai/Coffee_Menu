import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileShell } from "@/components/mobile-shell";
import { Providers } from "@/app/providers";
import { KakaoSdkScript } from "@/components/kakao-sdk-script";

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
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-dvh bg-zinc-100 font-sans text-zinc-900">
        <KakaoSdkScript />
        <Providers>
          <MobileShell>{children}</MobileShell>
        </Providers>
      </body>
    </html>
  );
}
