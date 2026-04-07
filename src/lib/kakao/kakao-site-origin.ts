/**
 * 가장 단순한 Redirect URI 생성.
 * - 기본: `window.location.origin` 사용
 * - 옵션: `NEXT_PUBLIC_SITE_URL` 이 번들에 있으면 그 값을 우선(슬래시 제거)
 */
export function getKakaoRedirectOrigin(): string {
  if (typeof window === "undefined") return "";

  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (typeof env === "string" && env.trim().length > 0) {
    return env.trim().replace(/\/$/, "");
  }

  return window.location.origin.replace(/\/$/, "");
}

export function getKakaoRedirectUri(): string {
  const origin = getKakaoRedirectOrigin();
  return origin ? `${origin}/auth/callback` : "";
}
