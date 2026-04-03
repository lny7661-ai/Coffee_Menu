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
};

type KakaoApiRequestOptions = {
  url: string;
  success?: (res: KakaoUserMeResponse) => void;
  fail?: (err: unknown) => void;
};

declare global {
  interface Window {
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
