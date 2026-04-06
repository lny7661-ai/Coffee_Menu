"use client";

import { useQuery } from "@tanstack/react-query";
import { useCafeSupabaseConfigured } from "@/lib/cafe/cafe-runtime-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { OrderRow } from "@/lib/types";

export function useMyOrder(sessionId: string, kakaoId: string | null) {
  const supabaseConfigured = useCafeSupabaseConfigured();
  return useQuery({
    queryKey: ["myOrder", sessionId, kakaoId],
    enabled:
      Boolean(sessionId) &&
      Boolean(kakaoId) &&
      supabaseConfigured,
    queryFn: async (): Promise<OrderRow | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("orders")
        .select("id,name,menu_item,session_id,room_id,created_at,kakao_id,updated_at")
        .eq("room_id", sessionId)
        .eq("kakao_id", kakaoId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as OrderRow | null;
    },
  });
}
