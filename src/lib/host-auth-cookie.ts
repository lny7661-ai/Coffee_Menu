import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "cafe_host_room";

export { COOKIE_NAME };

function getSecret(): string {
  const s = process.env.ROOM_HOST_SECRET;
  if (!s || !s.trim()) {
    throw new Error("ROOM_HOST_SECRET 환경 변수를 설정해 주세요.");
  }
  return s.trim();
}

/** roomId|expMs|hmacHex */
export function signHostRoomToken(roomId: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${roomId}|${exp}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}|${sig}`;
}

export function verifyHostRoomToken(token: string): string | null {
  try {
    const parts = token.split("|");
    if (parts.length !== 3) return null;
    const [roomId, expStr, sig] = parts;
    if (!roomId || !expStr || !sig) return null;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;
    const payload = `${roomId}|${expStr}`;
    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return roomId;
  } catch {
    return null;
  }
}

export function hostAuthCookieHeader(roomId: string): string {
  const token = signHostRoomToken(roomId);
  const maxAge = 7 * 24 * 60 * 60;
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function hostAuthClearCookieHeader(): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
