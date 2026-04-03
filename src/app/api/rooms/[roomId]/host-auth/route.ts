import { NextResponse } from "next/server";
import { isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import { hostAuthClearCookieHeader, hostAuthCookieHeader } from "@/lib/host-auth-cookie";
import { verifyRoomHostPassword } from "@/lib/server/verify-room-host-password";

export const runtime = "nodejs";

/**
 * 방 비밀번호 검증 — DB 해시는 service_role 로만 읽고 bcrypt 로 비교합니다.
 * 성공 시 HttpOnly 쿠키만 설정합니다(주문 본문 없음).
 */
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
    return NextResponse.json(
      { ok: true },
      {
        status: 200,
        headers: { "Set-Cookie": hostAuthCookieHeader(roomId) },
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error:
          "쿠키 서명에 실패했습니다. 서버에 ROOM_HOST_SECRET 을 설정해 주세요.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ roomId: string }> },
) {
  await context.params;
  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: { "Set-Cookie": hostAuthClearCookieHeader() },
    },
  );
}
