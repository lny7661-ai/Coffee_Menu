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

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: KakaoShareSendDefaultParams) => void;
      };
    };
  }
}
