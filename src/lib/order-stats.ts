/**
 * orders.menu_item 한 셀(여러 줄·(×n) 수량)을 메뉴별 잔 수로 합산.
 */
export type MenuStatLine = { label: string; count: number };

export function aggregateMenuItemRows(
  rows: { menu_item: string | null | undefined }[],
): MenuStatLine[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const raw = r.menu_item;
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text) continue;
    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      const m = line.match(/^(.*?)\s*\(×(\d+)\)\s*$/);
      const qty = m ? Math.max(1, parseInt(m[2], 10) || 1) : 1;
      const label = (m ? m[1] : line).trim();
      if (!label) continue;
      map.set(label, (map.get(label) ?? 0) + qty);
    }
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function formatStatsSentence(lines: MenuStatLine[]): string {
  if (lines.length === 0) return "아직 주문이 없습니다.";
  return lines
    .map(({ label, count }) => `${label} ${count}잔`)
    .join(", ");
}
