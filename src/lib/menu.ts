import type { MenuItem } from "@/lib/types";

const TEMP_LABEL: Record<MenuItem["temperature"], string> = {
  ice: "아이스",
  hot: "핫",
};

const MILK_LABEL: Record<MenuItem["milkOption"], string> = {
  regular: "일반우유",
  soy: "두유 변경",
  oat: "오트밀크 변경",
};

export function formatMenuItemLine(item: MenuItem): string {
  return `${TEMP_LABEL[item.temperature]} ${item.name} · ${MILK_LABEL[item.milkOption]} · ${item.priceWon.toLocaleString("ko-KR")}원`;
}

export function buildMenuLabel(
  menus: MenuItem[],
  selectedId: string | "other",
  otherDetail: string,
): string {
  if (selectedId === "other") {
    const trimmed = otherDetail.trim();
    return trimmed.length > 0 ? `기타: ${trimmed}` : "기타";
  }
  const found = menus.find((m) => m.id === selectedId);
  if (!found) return selectedId;
  return formatMenuItemLine(found);
}
