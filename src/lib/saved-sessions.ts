const STORAGE_KEY = "cafe_menu_saved_sessions_v1";

export type SavedSession = {
  id: string;
  label: string;
  createdAt: string;
  /** 방을 만든 주최자 이름 */
  createdBy: string;
};

/** 비어 있으면 UI 에서 「익명」으로 표시 */
export function displayHostName(createdBy: string): string {
  const t = createdBy.trim();
  return t.length > 0 ? t : "익명";
}

function readRaw(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is Omit<SavedSession, "createdBy"> & { createdBy?: string } =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as SavedSession).id === "string" &&
          typeof (x as SavedSession).label === "string" &&
          typeof (x as SavedSession).createdAt === "string",
      )
      .map((x) => ({
        ...x,
        createdBy:
          typeof x.createdBy === "string" ? x.createdBy : "",
      }));
  } catch {
    return [];
  }
}

function writeRaw(list: SavedSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getSavedSessions(): SavedSession[] {
  return readRaw().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getSavedSession(id: string): SavedSession | undefined {
  return readRaw().find((s) => s.id === id);
}

export function upsertSavedSession(entry: SavedSession) {
  const list = readRaw().filter((s) => s.id !== entry.id);
  list.push(entry);
  writeRaw(list);
}

export function updateSavedSessionLabel(id: string, label: string) {
  const list = readRaw();
  const i = list.findIndex((s) => s.id === id);
  if (i === -1) return;
  const next = label.trim() || list[i].label;
  if (hasDuplicateSessionLabel(next, id)) return;
  list[i] = { ...list[i], label: next };
  writeRaw(list);
}

function formatDateYyMmDd(d = new Date()): string {
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${yy}.${m}.${day}`;
}

/** "26.04.03 메뉴취합 (1)" 형태 — 당일 동일 패턴 중 가장 큰 번호 + 1 */
const MENU_GATHER_LABEL_RE =
  /^(\d{2}\.\d{2}\.\d{2}) 메뉴취합 \((\d+)\)$/;

export function nextDefaultRoomLabel(now = new Date()): string {
  const dateStr = formatDateYyMmDd(now);
  let maxN = 0;
  for (const s of readRaw()) {
    const m = s.label.trim().match(MENU_GATHER_LABEL_RE);
    if (!m) continue;
    if (m[1] !== dateStr) continue;
    const n = parseInt(m[2], 10);
    if (!Number.isNaN(n)) maxN = Math.max(maxN, n);
  }
  return `${dateStr} 메뉴취합 (${maxN + 1})`;
}

/** 방 이름 정규화 후 다른 방과 동일한지 (이름 중복 방지) */
export function hasDuplicateSessionLabel(
  label: string,
  excludeSessionId?: string,
): boolean {
  const n = label.trim();
  if (!n) return false;
  return readRaw().some(
    (s) =>
      s.id !== excludeSessionId && s.label.trim() === n,
  );
}

export function clearAllSavedSessions() {
  writeRaw([]);
}

