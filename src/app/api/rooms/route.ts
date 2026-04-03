import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json(
      { error: "서버에 Supabase service role 이 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  let body: { room_name?: string; password?: string };
  try {
    body = (await req.json()) as { room_name?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const room_name = String(body.room_name ?? "").trim();
  const password = String(body.password ?? "");

  if (!room_name) {
    return NextResponse.json({ error: "방 이름을 입력해 주세요." }, { status: 400 });
  }
  if (!/^\d{4,}$/.test(password)) {
    return NextResponse.json(
      { error: "비밀번호는 숫자 4자리 이상으로 설정해 주세요." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const supabase = createServiceSupabaseClient();
    const { error } = await supabase.from("rooms").insert({
      id,
      room_name,
      password_hash,
    });
    if (error) throw error;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "방을 만들지 못했습니다. DB 마이그레이션을 확인해 주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id, room_name });
}
