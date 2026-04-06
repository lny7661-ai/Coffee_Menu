import { NextResponse } from "next/server";
import { isServiceSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * 방 만들기 API 와 동일한 Node 라우트 컨텍스트에서 Supabase 서버 키 준비 여부만 반환합니다.
 * (페이지 RSC 와 env 가 어긋나 노란 박스만 뜨는 경우를 막기 위함)
 */
export async function GET() {
  return NextResponse.json({ ready: isServiceSupabaseConfigured() });
}
