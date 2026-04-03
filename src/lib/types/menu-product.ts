export type Temperature = "ice" | "hot";

export type MilkOption = "regular" | "soy" | "oat";

export type MenuCategory =
  | "coffee"
  | "iceCream"
  | "teaLatte"
  | "adeJuice"
  | "smoothieFrappe"
  | "signature";

/** 음료 온도 선택 범위 */
export type TemperatureMode = "hotOnly" | "iceOnly" | "both";

/** null이면 핫/아이스 등 온도 외 옵션 없음 */
export type ProductModifierFlags = {
  milkSwap: boolean;
  extraShot: boolean;
  decaf: boolean;
};

export type MenuProduct = {
  id: string;
  name: string;
  basePriceWon: number;
  category: MenuCategory;
  /** public 기준 경로 */
  imageSrc: string;
  /** 카드 이미지 우측 상단 ONLY ICED 배지 */
  icedOnly: boolean;
  temperatureMode: TemperatureMode;
  modifiers: ProductModifierFlags | null;
};

export type OrderOptions = {
  temperature: Temperature;
  milk: MilkOption;
  extraShot: boolean;
  decaf: boolean;
};

export const MILK_SWAP_PRICE = 300;
export const EXTRA_SHOT_PRICE = 500;
export const DECAF_PRICE = 500;
