import { NextResponse } from "next/server";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import {
  aggregateMenuItemRows,
  formatStatsSentence,
} from "@/lib/order-stats";

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
      { error: "서버 설정이 필요합니다.", lines: [], sentence: "" },
      { status: 503 },
    );
  }

  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("menu_item")
      .eq("room_id", roomId);
    if (error) throw error;
    const lines = aggregateMenuItemRows((data ?? []) as { menu_item: string }[]);
    return NextResponse.json({
      lines,
      sentence: formatStatsSentence(lines),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "통계를 불러오지 못했습니다." }, { status: 500 });
  }
}
