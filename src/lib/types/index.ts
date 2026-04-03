import type { MilkOption, Temperature } from "@/lib/types/menu-product";

export type { MilkOption, Temperature } from "@/lib/types/menu-product";

/** 레거시·호환용 (고정 조합 한 줄) */
export type MenuItem = {
  id: string;
  name: string;
  priceWon: number;
  temperature: Temperature;
  milkOption: MilkOption;
};

export type OrderSession = {
  id: string;
  title: string;
  createdAt: string;
};

export type {
  MenuCategory,
  MenuProduct,
  OrderOptions,
  ProductModifierFlags,
  TemperatureMode,
} from "@/lib/types/menu-product";
export {
  DECAF_PRICE,
  EXTRA_SHOT_PRICE,
  MILK_SWAP_PRICE,
} from "@/lib/types/menu-product";

export type ParticipantPick = {
  participantId: string;
  menuItemId: string;
  pickedAt: string;
};

export type OrderRow = {
  id: string;
  name: string;
  menu_item: string;
  created_at: string;
  /** 레거시·동기화용 (room_id 와 동일한 UUID 문자열) */
  session_id?: string;
  room_id: string;
  kakao_id?: string | null;
  updated_at?: string | null;
};
