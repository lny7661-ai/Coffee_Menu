import bcrypt from "bcryptjs";
import { createServiceSupabaseClient } from "@/lib/supabase/admin";

/**
 * 서버 전용. `rooms.password_hash` 는 Supabase **service_role** 로만 조회합니다.
 * 평문 비밀번호는 bcrypt 로만 비교합니다.
 */
export async function verifyRoomHostPassword(
  roomId: string,
  plainPassword: string,
): Promise<
  | { verified: true }
  | { verified: false; status: 401 | 404; message: string }
> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("password_hash")
    .eq("id", roomId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const hash = data?.password_hash;
  if (typeof hash !== "string" || !hash) {
    return {
      verified: false,
      status: 404,
      message: "방을 찾을 수 없습니다.",
    };
  }

  const match = await bcrypt.compare(plainPassword, hash);
  if (!match) {
    return {
      verified: false,
      status: 401,
      message: "비밀번호가 올바르지 않습니다.",
    };
  }

  return { verified: true };
}
