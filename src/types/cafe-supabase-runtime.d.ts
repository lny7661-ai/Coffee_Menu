export {};

declare global {
  interface Window {
    /** RootLayout 인라인 스크립트로 주입(공개 URL·anon 키) */
    __CAFE_SUPABASE_URL__?: string;
    __CAFE_SUPABASE_ANON_KEY__?: string;
    /** NEXT_PUBLIC_SITE_URL — 카카오 redirectUri 베이스(없으면 location.origin) */
    __CAFE_SITE_ORIGIN__?: string;
  }
}
