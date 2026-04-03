import type { MenuProduct, OrderOptions } from "@/lib/types/menu-product";
import {
  DECAF_PRICE,
  EXTRA_SHOT_PRICE,
  MILK_SWAP_PRICE,
} from "@/lib/types/menu-product";

const TEMP_LABEL = { ice: "아이스", hot: "핫" } as const;

const MILK_LABEL = {
  regular: "일반우유",
  soy: "두유 변경",
  oat: "오트밀크 변경",
} as const;

export function getDefaultOrderOptions(product: MenuProduct): OrderOptions {
  if (product.temperatureMode === "hotOnly") {
    return {
      temperature: "hot",
      milk: "regular",
      extraShot: false,
      decaf: false,
    };
  }
  if (product.temperatureMode === "iceOnly") {
    return {
      temperature: "ice",
      milk: "regular",
      extraShot: false,
      decaf: false,
    };
  }
  return {
    temperature: "ice",
    milk: "regular",
    extraShot: false,
    decaf: false,
  };
}

/** 온도 모드에 맞게 옵션 보정 */
export function clampOrderOptions(
  product: MenuProduct,
  options: OrderOptions,
): OrderOptions {
  let temperature = options.temperature;
  if (product.temperatureMode === "hotOnly") temperature = "hot";
  if (product.temperatureMode === "iceOnly") temperature = "ice";

  let milk = options.milk;
  if (!product.modifiers?.milkSwap) milk = "regular";

  let extraShot = options.extraShot;
  let decaf = options.decaf;
  if (!product.modifiers?.extraShot) extraShot = false;
  if (!product.modifiers?.decaf) decaf = false;

  return { temperature, milk, extraShot, decaf };
}

export function computePrice(
  product: MenuProduct,
  options: OrderOptions,
): number {
  const o = clampOrderOptions(product, options);
  let total = product.basePriceWon;
  if (product.modifiers?.milkSwap && o.milk !== "regular") {
    total += MILK_SWAP_PRICE;
  }
  if (product.modifiers?.extraShot && o.extraShot) total += EXTRA_SHOT_PRICE;
  if (product.modifiers?.decaf && o.decaf) total += DECAF_PRICE;
  return total;
}

export function formatOrderLine(
  product: MenuProduct,
  options: OrderOptions,
): string {
  const o = clampOrderOptions(product, options);
  const parts: string[] = [
    `${TEMP_LABEL[o.temperature]} ${product.name}`,
  ];

  if (product.modifiers?.milkSwap && o.milk !== "regular") {
    parts.push(MILK_LABEL[o.milk]);
  }
  if (product.modifiers?.extraShot && o.extraShot) {
    parts.push("샷추가");
  }
  if (product.modifiers?.decaf && o.decaf) {
    parts.push("디카페인");
  }

  const price = computePrice(product, o);
  parts.push(`${price.toLocaleString("ko-KR")}원`);

  return parts.join(" · ");
}

/** 기타 메뉴 직접 입력 — 비어 있으면 빈 문자열 */
export function formatCustomOrderLine(detail: string): string {
  const trimmed = detail.trim();
  return trimmed.length > 0 ? `기타: ${trimmed}` : "";
}
