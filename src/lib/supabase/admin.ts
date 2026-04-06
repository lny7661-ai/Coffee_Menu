import { loadEnvConfig } from "@next/env";
import dns from "node:dns";
import { createClient } from "@supabase/supabase-js";
import { getEnvLocalMapFromDisk, mergeEnvLocalFromDisk } from "@/lib/server/merge-env-local";

/** Windows 등에서 IPv6 우선 해석으로 Supabase 로의 fetch 가 실패하는 경우가 있어 IPv4 를 먼저 씁니다. */
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* 일부 런타임에서는 미지원 */
}

/**
 * 매 호출마다 cwd 기준으로 env 를 다시 맞춥니다.
 * (첫 호출 시 cwd 가 달라 .env.local 을 못 읽고 영구히 잠기는 경우 방지)
 */
function refreshEnvFromDisk(): void {
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  mergeEnvLocalFromDisk(cwd);
}

/** 따옴표·BOM·zero-width 제거 후 trim */
function normalizeEnvValue(raw: string): string {
  let v = raw.replace(/^\uFEFF+/, "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

function trimmedEnv(name: string): string | undefined {
  refreshEnvFromDisk();
  const raw = process.env[name];
  if (raw != null) {
    const v = normalizeEnvValue(String(raw));
    if (v.length > 0) return v;
  }
  /**
   * Next.js 16 + Turbopack: Route Handler 에서 process.env 가 프록시라
   * NEXT_PUBLIC_* / 서버 키가 undefined 로만 보이는 경우가 있음.
   * .env.local 은 디스크 맵으로 직접 읽는다.
   */
  const disk = getEnvLocalMapFromDisk(process.cwd()).get(name);
  if (disk == null) return undefined;
  const v = normalizeEnvValue(disk);
  return v.length > 0 ? v : undefined;
}

/** Legacy `service_role` JWT 또는 대시보드 Secret (`sb_secret_…`). */
function serviceRoleKey(): string | undefined {
  return (
    trimmedEnv("SUPABASE_SERVICE_ROLE_KEY") ?? trimmedEnv("SUPABASE_SECRET_KEY")
  );
}

/**
 * 서버 전용 — Route Handler·Server Action 등에서만 import 하세요.
 * RLS 를 우회하므로 **비밀번호 해시·주문 상세** 조회는 반드시 이 클라이언트로만 수행합니다.
 * `SUPABASE_SERVICE_ROLE_KEY` 는 `.env.local` 에만 두고 클라이언트 번들에 노출하지 마세요.
 */
export function createServiceSupabaseClient() {
  const url = trimmedEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = serviceRoleKey();
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 서버 환경에 필요합니다.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isServiceSupabaseConfigured(): boolean {
  return Boolean(trimmedEnv("NEXT_PUBLIC_SUPABASE_URL") && serviceRoleKey());
}

function maskSecretForLog(raw: string | undefined | null): string {
  if (raw == null) return "undefined";
  const t = normalizeEnvValue(String(raw));
  if (t.length === 0) return "empty_after_normalize";
  return `${t.slice(0, 4)}…(len=${t.length})`;
}

/**
 * Route Handler 등 서버 전용. 값 전체를 절대 로그하지 않습니다.
 * 클라이언트 번들에서 import 하지 마세요.
 */
export function logServiceSupabaseEnvDiagnostics(tag: string): void {
  refreshEnvFromDisk();
  const diskMap = getEnvLocalMapFromDisk(process.cwd());
  const url = trimmedEnv("NEXT_PUBLIC_SUPABASE_URL");
  const effectiveKey = serviceRoleKey();
  let urlHint = "MISSING";
  if (url) {
    try {
      const u = new URL(url);
      urlHint = `${u.protocol}//${u.hostname}`;
    } catch {
      urlHint = "INVALID_URL_STRING";
    }
  }
  console.log(`${tag} [supabase 서버 env]`, {
    cwd: process.cwd(),
    NODE_ENV: process.env.NODE_ENV,
    envLocalParsedKeyCount: diskMap.size,
    envLocalParsedKeys: [...diskMap.keys()].sort(),
    NEXT_PUBLIC_SUPABASE_URL: urlHint,
    raw_SUPABASE_SERVICE_ROLE_KEY: maskSecretForLog(process.env.SUPABASE_SERVICE_ROLE_KEY),
    raw_SUPABASE_SECRET_KEY: maskSecretForLog(process.env.SUPABASE_SECRET_KEY),
    effectiveServiceKey: maskSecretForLog(effectiveKey ?? null),
    effectiveServiceKeyPresent: Boolean(effectiveKey),
    isServiceSupabaseConfigured: Boolean(url && effectiveKey),
  });
}
