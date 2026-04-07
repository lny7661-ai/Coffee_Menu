import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

/** BOM·zero-width 등 키/값에서 제거 */
function stripInvisibleKey(key: string): string {
  return key.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function stripInvisibleValue(val: string): string {
  return val
    .replace(/^\uFEFF+/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function envIsEffectivelyEmpty(cur: string | undefined): boolean {
  return cur == null || String(cur).trim() === "";
}

function parseEnvLocalText(text: string): Map<string, string> {
  const out = new Map<string, string>();
  let t = text;
  if (t.charCodeAt(0) === 0xfeff) {
    t = t.slice(1);
  }
  /* \r 만 쓰인 줄바꿈(구 Mac·일부 에디터)은 \r?\n 만으로는 한 줄로 뭉쳐 키가 1개만 파싱됨 */
  for (const line of t.split(/\r\n|\n|\r/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = stripInvisibleKey(trimmed.slice(0, eq));
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    val = stripInvisibleValue(val);
    out.set(key, val);
  }
  return out;
}

const cacheByResolvedPath = new Map<
  string,
  { mtime: number; map: Map<string, string> }
>();

/**
 * Turbopack 등에서 process.env 가 프록시라 읽기/대입이 안 먹는 경우를 위해
 * 디스크의 .env.local 을 직접 파싱한 맵을 반환합니다 (절대 경로 + mtime 캐시).
 */
export function getEnvLocalMapFromDisk(cwd: string = process.cwd()): Map<string, string> {
  const absPath = resolve(cwd, ".env.local");
  if (!existsSync(absPath)) {
    return new Map();
  }
  let mtime = 0;
  try {
    mtime = statSync(absPath).mtimeMs;
  } catch {
    return new Map();
  }
  const hit = cacheByResolvedPath.get(absPath);
  if (hit && hit.mtime === mtime) {
    return hit.map;
  }
  let text: string;
  try {
    text = readFileSync(absPath, "utf8");
  } catch {
    return new Map();
  }
  const map = parseEnvLocalText(text);
  cacheByResolvedPath.set(absPath, { mtime, map });
  return map;
}

/**
 * Next/Turbopack 워커에서 process.env 에 서버 키가 비는 경우를 대비해
 * 프로젝트 루트의 .env.local 을 직접 읽어 비어 있는 키만 채웁니다.
 */
export function mergeEnvLocalFromDisk(cwd: string = process.cwd()): void {
  const map = getEnvLocalMapFromDisk(cwd);
  for (const [key, val] of map) {
    const cur = process.env[key];
    const forceInDev =
      process.env.NODE_ENV === "development" &&
      val.length > 0 &&
      (key === "SUPABASE_SERVICE_ROLE_KEY" ||
        key === "SUPABASE_SECRET_KEY" ||
        key === "NEXT_PUBLIC_SUPABASE_URL" ||
        key === "NEXT_PUBLIC_SUPABASE_ANON_KEY" ||
        key === "NEXT_PUBLIC_SITE_URL");
    if (forceInDev || envIsEffectivelyEmpty(cur)) {
      try {
        process.env[key] = val;
      } catch {
        /* 일부 런타임은 process.env 대입 불가 */
      }
    }
  }
}
