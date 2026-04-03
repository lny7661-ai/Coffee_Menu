/**
 * 카카오 JavaScript SDK 초기화.
 * 키는 코드에 직접 넣지 않고 `NEXT_PUBLIC_KAKAO_JS_KEY` 에서만 읽습니다.
 * (빌드 시점에 클라이언트 번들에 주입됨)
 */

export function getKakaoJavaScriptKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (typeof key !== "string") return undefined;
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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
        if (!Kakao.isInitialized()) {
          Kakao.init(key);
        }
      } catch {
        return false;
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
