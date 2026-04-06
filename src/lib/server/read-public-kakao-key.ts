import { loadEnvConfig } from "@next/env";
import { getEnvLocalMapFromDisk, mergeEnvLocalFromDisk } from "@/lib/server/merge-env-local";

/**
 * Server Component / layout 전용. 클라이언트 번들에 env 가 비는 경우를 줄이기 위해
 * 디스크 `.env.local` 까지 반영한 뒤 카카오 JavaScript 키를 읽습니다.
 */
export function readPublicKakaoJavaScriptKey(): string | undefined {
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  mergeEnvLocalFromDisk(cwd);
  const raw =
    process.env.NEXT_PUBLIC_KAKAO_JS_KEY ??
    getEnvLocalMapFromDisk(cwd).get("NEXT_PUBLIC_KAKAO_JS_KEY");
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}
