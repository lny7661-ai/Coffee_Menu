export {};

type KakaoShareLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoShareSendDefaultParams = {
  objectType: "feed";
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: KakaoShareLink;
  };
  buttons?: Array<{
    title: string;
    link: KakaoShareLink;
  }>;
};

export type KakaoUserMeResponse = {
  id: number;
  kakao_account?: {
    profile?: {
      nickname?: string;
    };
  };
};

type KakaoAuthLoginOptions = {
  success?: (authObj: unknown) => void;
  fail?: (err: unknown) => void;
  /** 예: profile_nickname — 닉네임 동의 */
  scope?: string;
  /** 카카오톡 앱 로그인 유도 등 */
  throughTalk?: boolean;
};

type KakaoApiRequestOptions = {
  url: string;
  success?: (res: KakaoUserMeResponse) => void;
  fail?: (err: unknown) => void;
};

declare global {
  interface Window {
    /** RootLayout 인라인 스크립트로 주입(공개 JS 키) */
    __CAFE_KAKAO_JS_KEY__?: string;
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: KakaoAuthLoginOptions) => void;
      };
      API: {
        request: (options: KakaoApiRequestOptions) => void;
      };
      Share: {
        sendDefault: (params: KakaoShareSendDefaultParams) => void;
      };
    };
  }
}
