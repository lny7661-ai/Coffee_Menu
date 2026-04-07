/**
 * 카카오 JavaScript 키 — 브라우저에서는 layout `<head>` 가 심은 `window.__CAFE_KAKAO_JS_KEY__` 만 사용.
 */

export function getKakaoJavaScriptKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const injected = window.__CAFE_KAKAO_JS_KEY__;
  if (typeof injected !== "string") return undefined;
  const t = injected.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * `kakao.min.js` 로드 후 `Kakao.init` 까지 수행.
 * @returns 초기화 성공 여부
 */
export function initKakaoSdkWhenReady(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    const key = getKakaoJavaScriptKey();
    if (!key) {
      resolve(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 120;
    const tickMs = 50;

    const tryInit = (Kakao: NonNullable<typeof window.Kakao>) => {
      try {
        if (Kakao.isInitialized()) {
          return true;
        }
        Kakao.init(key);
      } catch {
        return Kakao.isInitialized();
      }
      return Kakao.isInitialized();
    };

    const id = window.setInterval(() => {
      attempts += 1;
      const Kakao = window.Kakao;
      if (Kakao) {
        window.clearInterval(id);
        resolve(tryInit(Kakao));
        return;
      }
      if (attempts >= maxAttempts) {
        window.clearInterval(id);
        resolve(false);
      }
    }, tickMs);
  });
}

/**
 * 로그인 직전: 키가 있고, SDK가 있으면 `isInitialized()` 가 false 일 때만 `init` 호출.
 */
export function ensureKakaoInitializedFromWindow(): boolean {
  if (typeof window === "undefined") return false;
  const key = getKakaoJavaScriptKey();
  if (!key) return false;
  const Kakao = window.Kakao;
  if (!Kakao) return false;
  try {
    if (!Kakao.isInitialized()) {
      Kakao.init(key);
    }
  } catch {
    return Kakao.isInitialized();
  }
  return Kakao.isInitialized();
}

/** 폴링으로 SDK 로드 대기 후, 필요 시에만 init. 로그인 직전 반드시 호출. */
export async function ensureKakaoReadyForLogin(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("카카오 로그인은 브라우저에서만 가능합니다.");
  }
  const debug =
    process.env.NODE_ENV === "development" ||
    new URLSearchParams(window.location.search).get("debugKakao") === "1";

  const key = getKakaoJavaScriptKey();
  if (!key) {
    throw new Error(
      "window.__CAFE_KAKAO_JS_KEY__ 가 없습니다. layout head 주입·Vercel 환경 변수를 확인하세요.",
    );
  }

  const polled = await initKakaoSdkWhenReady();
  const Kakao = window.Kakao;
  if (!Kakao) {
    throw new Error(
      "window.Kakao 가 없습니다. SDK 스크립트 로드·네트워크 차단을 확인하세요.",
    );
  }
  if (polled && Kakao.isInitialized()) {
    return;
  }
  if (ensureKakaoInitializedFromWindow() && window.Kakao?.isInitialized()) {
    return;
  }
  if (debug) {
    console.error("[Kakao SDK] ensureKakaoReadyForLogin 실패", {
      hasKey: Boolean(key),
      keyMasked: `${key.slice(0, 4)}…${key.slice(-4)}`,
      hasWindowKakao: Boolean(Kakao),
      polled,
      isInitialized: Kakao?.isInitialized?.(),
    });
  }
  throw new Error(
    "카카오 SDK 를 초기화하지 못했습니다. JavaScript 키·Web 도메인 등록을 확인하세요.",
  );
}
