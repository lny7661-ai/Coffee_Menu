"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  createBrowserSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import type { OrderRow } from "@/lib/types";

function getClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserSupabaseClient();
}

export function useOrders(sessionId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["orders", sessionId],
    enabled: Boolean(sessionId) && isSupabaseConfigured(),
    queryFn: async (): Promise<OrderRow[]> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("orders")
        .select("id,name,menu,session_id,created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  useEffect(() => {
    if (!sessionId) return;
    const supabase = getClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`orders-realtime-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orders", sessionId] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  return query;
}
