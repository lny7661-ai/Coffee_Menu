import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function trimStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

const GLOBAL_KEY = "__cafeBrowserSupabase";
const GLOBAL_CACHE_KEY = "__cafeBrowserSupabaseKey";

type GlobalSupabase = typeof globalThis & {
  [GLOBAL_KEY]?: SupabaseClient;
  [GLOBAL_CACHE_KEY]?: string;
};

/** 브라우저 탭당 하나 — Multiple GoTrueClient / 중복 createClient 완화 */
let browserClient: SupabaseClient | undefined;
let browserClientCacheKey: string | undefined;

/** 브라우저 전용: layout `<head>` 가 심은 값만 사용(process.env 금지) */
export function readCafeSupabaseFromWindow(): {
  url: string | undefined;
  anonKey: string | undefined;
} {
  if (typeof window === "undefined") {
    return { url: undefined, anonKey: undefined };
  }
  return {
    url: trimStr(window.__CAFE_SUPABASE_URL__),
    anonKey: trimStr(window.__CAFE_SUPABASE_ANON_KEY__),
  };
}

function supabaseLayoutSaysConfigured(): boolean {
  if (typeof document === "undefined") return false;
  return document.body?.getAttribute("data-cafe-supabase") === "configured";
}

let loggedMissingOnce = false;
let loggedOkOnce = false;

function maskCredential(s: string): string {
  if (s.length <= 8) return "***";
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

function getGlobalSingleton(): SupabaseClient | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return (globalThis as GlobalSupabase)[GLOBAL_KEY];
}

function setGlobalSingleton(client: SupabaseClient, key: string): void {
  if (typeof globalThis === "undefined") return;
  const g = globalThis as GlobalSupabase;
  g[GLOBAL_KEY] = client;
  g[GLOBAL_CACHE_KEY] = key;
}

/**
 * 브라우저 Supabase: **오직** `window.__CAFE_SUPABASE_*`(layout `<head>` 주입)만 사용.
 * 싱글톤 — 모듈 + `globalThis` 로 HMR/중복 번들에서도 동일 인스턴스 재사용.
 * 앱은 Supabase Auth 로그인을 쓰지 않고 anon API 만 쓰므로 auth 세션 비활성화로 GoTrue 중복 완화.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error(
      "createBrowserSupabaseClient 는 브라우저에서만 호출할 수 있습니다.",
    );
  }

  const url = trimStr(window.__CAFE_SUPABASE_URL__);
  const anonKey = trimStr(window.__CAFE_SUPABASE_ANON_KEY__);
  const cacheKey = url && anonKey ? `${url}\0${anonKey}` : "";

  const gExisting = getGlobalSingleton();
  const gKey = (globalThis as GlobalSupabase)[GLOBAL_CACHE_KEY];
  if (gExisting && gKey === cacheKey && cacheKey) {
    browserClient = gExisting;
    browserClientCacheKey = cacheKey;
    return gExisting;
  }

  if (browserClient && browserClientCacheKey === cacheKey && cacheKey) {
    setGlobalSingleton(browserClient, cacheKey);
    return browserClient;
  }

  if (!url || !anonKey) {
    if (!loggedMissingOnce) {
      loggedMissingOnce = true;
      console.error(
        "[Supabase browser] window.__CAFE_SUPABASE_URL__ / __CAFE_SUPABASE_ANON_KEY__ 가 비어 있습니다. layout `<head>` 인라인 주입을 확인하세요.",
        {
          urlDefined: Boolean(url),
          anonKeyDefined: Boolean(anonKey),
          dataCafeSupabase: document.body?.getAttribute("data-cafe-supabase"),
        },
      );
    }
    throw new Error(
      "Supabase 브라우저 키가 주입되지 않았습니다. RootLayout head 스크립트를 확인하세요.",
    );
  }

  if (!supabaseLayoutSaysConfigured()) {
    console.warn(
      "[Supabase browser] data-cafe-supabase 가 configured 가 아닌데 createClient 가 호출되었습니다.",
    );
  }

  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "cafe-menu-supabase-auth",
    },
  });

  browserClient = client;
  browserClientCacheKey = cacheKey;
  setGlobalSingleton(client, cacheKey);

  if (process.env.NODE_ENV === "development" && !loggedOkOnce) {
    loggedOkOnce = true;
    console.log("[Supabase browser] createClient 싱글톤 생성 (마스킹)", {
      url: maskCredential(url),
      anonKey: maskCredential(anonKey),
    });
  }

  return client;
}
