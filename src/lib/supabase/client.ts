import { createClient } from "@supabase/supabase-js";

function trimStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

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

/**
 * 브라우저 Supabase: **오직** `window.__CAFE_SUPABASE_*`(layout `<head>` 주입)만 사용.
 * `data-cafe-supabase=configured` 일 때만 호출되도록 `useCafeSupabaseConfigured` 와 함께 쓰는 것을 권장.
 */
export function createBrowserSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error(
      "createBrowserSupabaseClient 는 브라우저에서만 호출할 수 있습니다.",
    );
  }

  const url = trimStr(window.__CAFE_SUPABASE_URL__);
  const anonKey = trimStr(window.__CAFE_SUPABASE_ANON_KEY__);

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

  if (process.env.NODE_ENV === "development" && !loggedOkOnce) {
    loggedOkOnce = true;
    console.log("[Supabase browser] createClient (window 전용, 마스킹)", {
      url: maskCredential(url),
      anonKey: maskCredential(anonKey),
    });
  }

  return createClient(url, anonKey);
}
