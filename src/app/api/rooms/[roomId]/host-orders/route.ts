import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import {
  COOKIE_NAME,
  verifyHostRoomToken,
} from "@/lib/host-auth-cookie";

export const runtime = "nodejs";

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
  if (verifiedRoomId !== roomId) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id,name,menu_item,created_at,kakao_id,room_id")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
