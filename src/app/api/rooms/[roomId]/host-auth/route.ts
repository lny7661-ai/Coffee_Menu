import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import { hostAuthClearCookieHeader, hostAuthCookieHeader } from "@/lib/host-auth-cookie";

export const runtime = "nodejs";

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
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("password_hash")
      .eq("id", roomId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.password_hash) {
      return NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 });
    }
    const ok = await bcrypt.compare(password, data.password_hash as string);
    if (!ok) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
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
