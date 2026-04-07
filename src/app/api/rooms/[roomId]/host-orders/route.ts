import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import {
  COOKIE_NAME,
  hostAuthCookieHeader,
  verifyHostRoomToken,
} from "@/lib/host-auth-cookie";
import { fetchOrdersForRoom } from "@/lib/server/fetch-room-orders";
import { verifyRoomHostPassword } from "@/lib/server/verify-room-host-password";
import { normalizeRoomIdForAuth } from "@/lib/server/normalize-room-id";

export const runtime = "nodejs";

/**
 * GET: 이전에 bcrypt 검증으로 받은 서명 쿠키가 있을 때만 상세 주문을 반환합니다.
 * POST: 요청 본문의 비밀번호를 service_role 로 읽은 해시와 bcrypt 비교한 뒤,
 *       성공한 경우에만 주문을 반환하고 동일한 쿠키를 발급합니다.
 */

export async function GET(
  _req: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await context.params;
  if (!roomId) {
    return NextResponse.json({ error: "roomId 가 필요합니다." }, { status: 400 });
  }

  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json({ error: "서버 설정이 필요합니다." }, { status: 503 });
  }

  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  const token = raw ? decodeURIComponent(raw) : "";
  const verifiedRoomId = token ? verifyHostRoomToken(token) : null;
  const want = normalizeRoomIdForAuth(roomId);
  const got = verifiedRoomId ? normalizeRoomIdForAuth(verifiedRoomId) : null;
  if (!got || got !== want) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const orders = await fetchOrdersForRoom(roomId);
    return NextResponse.json({ orders });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await context.params;
  if (!roomId) {
    return NextResponse.json({ error: "roomId 가 필요합니다." }, { status: 400 });
  }

  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json({ error: "서버 설정이 필요합니다." }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (!password) {
    return NextResponse.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
  }

  try {
    const result = await verifyRoomHostPassword(roomId, password);
    if (!result.verified) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status },
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "확인에 실패했습니다." }, { status: 500 });
  }

  try {
    const orders = await fetchOrdersForRoom(roomId);
    return NextResponse.json(
      { orders },
      {
        status: 200,
        headers: { "Set-Cookie": hostAuthCookieHeader(roomId) },
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
