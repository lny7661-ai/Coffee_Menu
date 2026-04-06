import type { KakaoUserMeResponse } from "@/types/kakao";
import { ensureKakaoReadyForLogin } from "@/lib/kakao/init-kakao-sdk";

export type KakaoParticipantProfile = {
  id: string;
  nickname: string;
};

const STORAGE_KEY = "cafe_menu_kakao_profile_v1";

export function loadStoredKakaoProfile(): KakaoParticipantProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as unknown;
    if (
      typeof p === "object" &&
      p !== null &&
      typeof (p as KakaoParticipantProfile).id === "string" &&
      typeof (p as KakaoParticipantProfile).nickname === "string"
    ) {
      return p as KakaoParticipantProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveKakaoProfile(profile: KakaoParticipantProfile) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearKakaoProfile() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

function parseUserMe(res: KakaoUserMeResponse): KakaoParticipantProfile {
  const nickname =
    res.kakao_account?.profile?.nickname?.trim() || "카카오 사용자";
  return { id: String(res.id), nickname };
}

/**
 * 카카오 로그인 후 사용자 id·닉네임. SDK 로드·init 후 호출.
 */
export async function loginWithKakao(): Promise<KakaoParticipantProfile> {
  if (typeof window === "undefined") {
    throw new Error("카카오 로그인은 브라우저에서만 가능합니다.");
  }
  await ensureKakaoReadyForLogin();
  const Kakao = window.Kakao;
  if (!Kakao) {
    throw new Error("카카오 SDK 객체(window.Kakao)가 없습니다.");
  }
  if (!Kakao.isInitialized()) {
    throw new Error("카카오 SDK 가 초기화되지 않았습니다.");
  }
  if (!Kakao.Auth?.login || !Kakao.API?.request) {
    throw new Error("카카오 로그인 API 를 사용할 수 없습니다.");
  }

  await new Promise<void>((resolve, reject) => {
    Kakao.Auth.login({
      scope: "profile_nickname",
      success: () => resolve(),
      fail: (err) =>
        reject(err instanceof Error ? err : new Error(String(err))),
    });
  });

  const me = await new Promise<KakaoUserMeResponse>((resolve, reject) => {
    Kakao.API.request({
      url: "/v2/user/me",
      success: (res) => resolve(res),
      fail: (err) =>
        reject(err instanceof Error ? err : new Error(String(err))),
    });
  });

  const profile = parseUserMe(me);
  saveKakaoProfile(profile);
  return profile;
}
