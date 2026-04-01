import type { MenuItem } from "@/lib/types";

export const DEFAULT_MENUS: MenuItem[] = [
  {
    id: "americano-ice",
    name: "아메리카노",
    priceWon: 4500,
    temperature: "ice",
    milkOption: "regular",
  },
  {
    id: "americano-hot",
    name: "아메리카노",
    priceWon: 4500,
    temperature: "hot",
    milkOption: "regular",
  },
  {
    id: "latte-soy",
    name: "카페라떼",
    priceWon: 5500,
    temperature: "ice",
    milkOption: "soy",
  },
  {
    id: "latte-oat",
    name: "카페라떼",
    priceWon: 5500,
    temperature: "hot",
    milkOption: "oat",
  },
  {
    id: "vanilla-regular",
    name: "바닐라라떼",
    priceWon: 6000,
    temperature: "ice",
    milkOption: "regular",
  },
];
