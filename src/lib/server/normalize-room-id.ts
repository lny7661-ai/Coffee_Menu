/**
 * 호스트 쿠키·URL 의 roomId 비교용(UUID 대소문자·공백 차이 흡수).
 */
export function normalizeRoomIdForAuth(roomId: string): string {
  const t = roomId.trim();
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  ) {
    return t.toLowerCase();
  }
  return t;
}
