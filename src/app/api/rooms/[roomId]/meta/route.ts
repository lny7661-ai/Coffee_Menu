import { NextResponse } from "next/server";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";

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
    return NextResponse.json(
      { error: "서버 설정이 필요합니다." },
      { status: 503 },
    );
  }

  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("room_name")
      .eq("id", roomId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json({ room_name: data.room_name as string });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "조회에 실패했습니다." }, { status: 500 });
  }
}
