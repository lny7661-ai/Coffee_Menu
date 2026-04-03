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
  menu: string;
  created_at: string;
  session_id: string;
};
