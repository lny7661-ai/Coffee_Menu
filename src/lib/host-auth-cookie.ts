import { createHash, createHmac, timingSafeEqual } from "crypto";
import { loadEnvConfig } from "@next/env";
import { getEnvLocalMapFromDisk, mergeEnvLocalFromDisk } from "@/lib/server/merge-env-local";

const COOKIE_NAME = "cafe_host_room";

/** PC/모바일 공통: 사이트 전역에서 호스트 인증 유지 */
const HOST_AUTH_COOKIE_FIXED = "Path=/; HttpOnly; SameSite=Lax";

export { COOKIE_NAME };

function refreshEnvForHostSecret(): void {
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  mergeEnvLocalFromDisk(cwd);
}

function derivedSecretFromServiceRole(): string | undefined {
  refreshEnvForHostSecret();
  const map = getEnvLocalMapFromDisk(process.cwd());
  const sr =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    map.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
    map.get("SUPABASE_SECRET_KEY")?.trim();
  if (!sr) return undefined;
  return createHash("sha256")
    .update(`cafe_menu_host_cookie_v1:${sr}`, "utf8")
    .digest("hex");
}

let warnedRoomHostFallback = false;

/**
 * 1) ROOM_HOST_SECRET 우선
 * 2) 없으면 서비스 롤 키로 결정적 파생(개발·운영 공통 — ROOM_HOST_SECRET 미설정 시 500 방지)
 * 3) 그것도 없으면 약한 고정 폴백(로그만 남김)
 */
function getSecret(): string {
  const explicit = process.env.ROOM_HOST_SECRET?.trim();
  if (explicit) return explicit;

  const derived = derivedSecretFromServiceRole();
  if (derived) {
    if (!warnedRoomHostFallback) {
      warnedRoomHostFallback = true;
      console.warn(
        "[host-auth-cookie] ROOM_HOST_SECRET 미설정 — SUPABASE_SERVICE_ROLE_KEY 기반 파생 시크릿을 사용합니다. 배포 환경에서는 ROOM_HOST_SECRET 을 별도로 설정하는 것을 권장합니다.",
      );
    }
    return derived;
  }

  if (!warnedRoomHostFallback) {
    warnedRoomHostFallback = true;
    console.error(
      "[host-auth-cookie] ROOM_HOST_SECRET 및 Supabase 서비스 키가 모두 없어 약한 폴백 시크릿을 사용합니다. 즉시 환경 변수를 설정하세요.",
    );
  }
  return "__cafe_menu_host_cookie_fallback_no_keys__";
}

/** roomId|expMs|hmacHex */
export function signHostRoomToken(roomId: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${roomId}|${exp}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}|${sig}`;
}

export function verifyHostRoomToken(token: string): string | null {
  try {
    const parts = token.split("|");
    if (parts.length !== 3) return null;
    const [roomId, expStr, sig] = parts;
    if (!roomId || !expStr || !sig) return null;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    const payload = `${roomId}|${expStr}`;
    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return roomId;
  } catch {
    return null;
  }
}

/**
 * Secure 플래그: `ROOM_HOST_COOKIE_SECURE=true` 이면 항상 Secure.
 * `false` 이면 항상 생략. 미설정이면 Vercel 프로덕션(`VERCEL`)에서만 기본 Secure.
 * 로컬 `next start`(NODE_ENV=production, HTTP)에서는 Secure 를 붙이지 않음.
 */
function cookieSecureDirective(): string {
  if (process.env.ROOM_HOST_COOKIE_SECURE === "false") return "";
  if (process.env.ROOM_HOST_COOKIE_SECURE === "true") return "; Secure";
  if (process.env.NODE_ENV !== "production") return "";
  if (process.env.VERCEL) return "; Secure";
  return "";
}

export function hostAuthCookieHeader(roomId: string): string {
  const token = signHostRoomToken(roomId);
  const maxAge = 7 * 24 * 60 * 60;
  const secure = cookieSecureDirective();
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; ${HOST_AUTH_COOKIE_FIXED}; Max-Age=${maxAge}${secure}`;
}

export function hostAuthClearCookieHeader(): string {
  const secure = cookieSecureDirective();
  return `${COOKIE_NAME}=; ${HOST_AUTH_COOKIE_FIXED}; Max-Age=0${secure}`;
}
