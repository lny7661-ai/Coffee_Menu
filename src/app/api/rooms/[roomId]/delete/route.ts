import { NextResponse } from "next/server";
import { createServiceSupabaseClient, isServiceSupabaseConfigured } from "@/lib/supabase/admin";
import { verifyRoomHostPassword } from "@/lib/server/verify-room-host-password";

export const runtime = "nodejs";

/**
 * 방 비밀번호 확인 후 DB 에서 방·관련 주문·마감 행 삭제.
 * localStorage 는 클라이언트에서 제거합니다.
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
    return NextResponse.json({ error: "비밀번호 확인에 실패했습니다." }, { status: 500 });
  }

  try {
    const supabase = createServiceSupabaseClient();
    const { error: oErr } = await supabase.from("orders").delete().eq("room_id", roomId);
    if (oErr) {
      console.error("orders delete:", oErr);
      return NextResponse.json(
        { error: "주문 데이터 삭제에 실패했습니다.", hint: oErr.message },
        { status: 500 },
      );
    }
    const { error: cErr } = await supabase
      .from("session_closures")
      .delete()
      .eq("session_id", roomId);
    if (cErr) {
      console.error("session_closures delete:", cErr);
      return NextResponse.json(
        { error: "마감 정보 삭제에 실패했습니다.", hint: cErr.message },
        { status: 500 },
      );
    }
    const { error: rErr } = await supabase.from("rooms").delete().eq("id", roomId);
    if (rErr) {
      console.error("rooms delete:", rErr);
      return NextResponse.json(
        { error: "방 삭제에 실패했습니다.", hint: rErr.message },
        { status: 500 },
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "삭제 처리 중 오류가 났습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
