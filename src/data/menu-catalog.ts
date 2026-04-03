import type {
  MenuCategory,
  MenuProduct,
  ProductModifierFlags,
  TemperatureMode,
} from "@/lib/types/menu-product";
import { MENU_LOCAL_IMAGE } from "@/data/menu-local-images";

const PLACEHOLDER = "/images/menu/placeholder.svg";

function img(id: string): string {
  return MENU_LOCAL_IMAGE[id] ?? PLACEHOLDER;
}

const blackCoffee: ProductModifierFlags = {
  milkSwap: false,
  extraShot: true,
  decaf: true,
};

const milkCoffee: ProductModifierFlags = {
  milkSwap: true,
  extraShot: true,
  decaf: true,
};

function item(
  id: string,
  name: string,
  basePriceWon: number,
  category: MenuCategory,
  temperatureMode: TemperatureMode,
  icedOnly: boolean,
  modifiers: ProductModifierFlags | null,
): MenuProduct {
  return {
    id,
    name,
    basePriceWon,
    category,
    imageSrc: img(id),
    temperatureMode,
    icedOnly,
    modifiers,
  };
}

export const MENU_CATALOG: MenuProduct[] = [
  // —— 커피 ——
  item("espresso", "에스프레소", 1500, "coffee", "hotOnly", false, {
    milkSwap: false,
    extraShot: true,
    decaf: true,
  }),
  item("lungo", "룽고", 1500, "coffee", "both", false, blackCoffee),
  item("americano", "아메리카노", 1500, "coffee", "both", false, blackCoffee),
  item("cafe-latte", "카페라떼", 2000, "coffee", "both", false, milkCoffee),
  item("flat-white", "플랫화이트", 2500, "coffee", "both", false, milkCoffee),
  item("vanilla-latte", "바닐라 라떼", 2000, "coffee", "both", false, milkCoffee),
  item("cafe-mocha", "카페 모카", 2000, "coffee", "both", false, milkCoffee),
  item("spanish-latte", "스페니쉬 라떼", 2800, "coffee", "both", false, milkCoffee),

  // —— 아이스크림 —— (전부 아이스 온리)
  item("affogato", "아포가토", 4000, "iceCream", "iceOnly", true, null),
  item(
    "ice-cream-cafe-latte",
    "아이스크림 카페라떼",
    4500,
    "iceCream",
    "iceOnly",
    true,
    milkCoffee,
  ),
  item("ice-cream", "아이스크림", 3500, "iceCream", "iceOnly", true, null),

  // —— 티·라떼 ——
  item("earl-grey", "얼그레이티", 2000, "teaLatte", "both", false, null),
  item("chamomile", "캐모마일티", 2000, "teaLatte", "both", false, null),
  item("peppermint", "페퍼민트티", 2000, "teaLatte", "both", false, null),
  item("peach-iced-tea", "피치 아이스티", 2000, "teaLatte", "iceOnly", true, null),
  item("red-fruit", "레드후르츠티", 2000, "teaLatte", "both", false, null),
  item("citron-chamomile", "유자캐모마일티", 2000, "teaLatte", "both", false, null),
  item(
    "grapefruit-honey-black",
    "자몽허니블랙티",
    2500,
    "teaLatte",
    "both",
    false,
    null,
  ),
  item("matcha-latte", "말차라떼", 2000, "teaLatte", "both", false, null),
  item("black-tea-latte", "블랙티라떼", 2000, "teaLatte", "both", false, null),
  item("chocolate-latte", "초콜릿라떼", 2000, "teaLatte", "both", false, null),

  // —— 에이드·주스 —— (카테고리 전부 ONLY ICED)
  item("grapefruit-ade", "자몽에이드", 3500, "adeJuice", "iceOnly", true, null),
  item("lemon-ade", "레몬에이드", 3500, "adeJuice", "iceOnly", true, null),
  item("sweet-peach-ade", "납작복숭아에이드", 3500, "adeJuice", "iceOnly", true, null),
  item("hanrabong-ade", "한라봉에이드", 3500, "adeJuice", "iceOnly", true, null),
  item("strawberry-juice", "딸기주스", 3500, "adeJuice", "iceOnly", true, null),
  item(
    "strawberry-banana-juice",
    "딸기바나나주스",
    3500,
    "adeJuice",
    "iceOnly",
    true,
    null,
  ),

  // —— 스무디·프라페 ——
  item(
    "plain-yogurt-smoothie",
    "플레인요거트스무디",
    3500,
    "smoothieFrappe",
    "iceOnly",
    true,
    null,
  ),
  item(
    "strawberry-yogurt-smoothie",
    "딸기요거트스무디",
    3500,
    "smoothieFrappe",
    "iceOnly",
    true,
    null,
  ),
  item(
    "blueberry-yogurt-smoothie",
    "블루베리요거트스무디",
    3500,
    "smoothieFrappe",
    "iceOnly",
    true,
    null,
  ),
  item(
    "ginseng-honey-smoothie",
    "진생허니스무디",
    3500,
    "smoothieFrappe",
    "iceOnly",
    true,
    null,
  ),
  item(
    "healthy-yam-banana-smoothie",
    "Healthy마나나스무디",
    3500,
    "smoothieFrappe",
    "iceOnly",
    true,
    null,
  ),
  item(
    "java-chip-latte-frappe",
    "자바칩 라떼 프라페",
    4000,
    "smoothieFrappe",
    "iceOnly",
    true,
    milkCoffee,
  ),
  item(
    "chocolate-frappe",
    "초콜릿 프라페",
    4000,
    "smoothieFrappe",
    "iceOnly",
    true,
    milkCoffee,
  ),
  item(
    "matcha-frappe",
    "말차 프라페",
    4000,
    "smoothieFrappe",
    "iceOnly",
    true,
    milkCoffee,
  ),

  // —— 시그니처 ——
  item(
    "tri-blend-ade",
    "트라이블렌드에이드",
    3500,
    "signature",
    "iceOnly",
    true,
    null,
  ),
  item(
    "orange-bianco",
    "오렌지비앙코",
    3500,
    "signature",
    "iceOnly",
    true,
    null,
  ),
  item(
    "honey-ginger-latte",
    "꿀생강라떼",
    3500,
    "signature",
    "both",
    false,
    milkCoffee,
  ),
];

export const CATEGORY_ORDER: MenuCategory[] = [
  "coffee",
  "iceCream",
  "teaLatte",
  "adeJuice",
  "smoothieFrappe",
  "signature",
];

export const CATEGORY_LABEL: Record<MenuCategory, string> = {
  coffee: "커피",
  iceCream: "아이스크림",
  teaLatte: "티·라떼",
  adeJuice: "에이드·주스",
  smoothieFrappe: "스무디·프라페",
  signature: "시그니처",
};

export function getMenuById(id: string): MenuProduct | undefined {
  return MENU_CATALOG.find((p) => p.id === id);
}
