import { loadEnvConfig } from "@next/env";
import { getEnvLocalMapFromDisk, mergeEnvLocalFromDisk } from "@/lib/server/merge-env-local";

export type PublicSupabaseBrowserConfig = {
  url: string | undefined;
  anonKey: string | undefined;
};

function firstNonEmpty(
  a: string | undefined,
  b: string | undefined,
): string | undefined {
  const t1 = typeof a === "string" && a.trim().length > 0 ? a.trim() : undefined;
  if (t1) return t1;
  const t2 = typeof b === "string" && b.trim().length > 0 ? b.trim() : undefined;
  return t2;
}

/**
 * RootLayout 전용. Turbopack 등으로 클라이언트 번들에 NEXT_PUBLIC_* 가 비는 경우를 줄이기 위해
 * 디스크 `.env.local` 까지 반영한 뒤 URL·anon 키를 읽습니다.
 */
export function readPublicSupabaseBrowserConfig(): PublicSupabaseBrowserConfig {
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  mergeEnvLocalFromDisk(cwd);
  const map = getEnvLocalMapFromDisk(cwd);
  return {
    url: firstNonEmpty(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      map.get("NEXT_PUBLIC_SUPABASE_URL"),
    ),
    anonKey: firstNonEmpty(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      map.get("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    ),
  };
}
