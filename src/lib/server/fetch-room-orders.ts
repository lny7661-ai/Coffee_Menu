import { createServiceSupabaseClient } from "@/lib/supabase/admin";

/** service_role 로만 호출 — RLS 우회 */
export async function fetchOrdersForRoom(roomId: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id,name,menu_item,created_at,kakao_id,room_id")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
