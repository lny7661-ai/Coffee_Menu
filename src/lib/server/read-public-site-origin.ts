import { loadEnvConfig } from "@next/env";
import { getEnvLocalMapFromDisk, mergeEnvLocalFromDisk } from "@/lib/server/merge-env-local";

/**
 * 카카오 Redirect URI 등에 쓸 공개 베이스 URL (슬래시 없음).
 * 미설정 시 클라이언트에서 `window.location.origin` 사용.
 */
export function readPublicSiteOrigin(): string | undefined {
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  mergeEnvLocalFromDisk(cwd);
  const map = getEnvLocalMapFromDisk(cwd);
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    map.get("NEXT_PUBLIC_SITE_URL")?.trim();
  if (!raw) return undefined;
  const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
  return withScheme.replace(/\/$/, "");
}
