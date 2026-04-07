import { NextResponse } from "next/server";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import {
  aggregateMenuItemRows,
  formatStatsSentence,
  type MenuStatLine,
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

    if (error) {
      console.error("[api/rooms/.../stats] Supabase:", error.message, error.code);
      // 스키마 미적용·일시 오류여도 UI는 빈 통계로 유지
      return NextResponse.json({
        lines: [] as MenuStatLine[],
        sentence: formatStatsSentence([]),
      });
    }

    const lines = aggregateMenuItemRows(
      (data ?? []) as { menu_item: string | null }[],
    );
    return NextResponse.json({
      lines,
      sentence: formatStatsSentence(lines),
    });
  } catch (e) {
    console.error("[api/rooms/.../stats]", e);
    return NextResponse.json({
      lines: [] as MenuStatLine[],
      sentence: formatStatsSentence([]),
    });
  }
}
