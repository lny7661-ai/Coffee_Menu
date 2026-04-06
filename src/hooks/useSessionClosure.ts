"use client";

import { useQuery, useQueryClient, useMutation, useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useCafeSupabaseConfigured } from "@/lib/cafe/cafe-runtime-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function stableSortedRoomIdsKey(roomIds: string[]): string {
  return [...new Set(roomIds.filter(Boolean))].sort().join("\u0001");
}

/** 여러 방의 마감 여부(모집완료)를 한 번에 조회 */
export function useSessionClosuresMap(roomIds: string[]) {
  const supabaseConfigured = useCafeSupabaseConfigured();
  const idsKey = stableSortedRoomIdsKey(roomIds);
  const ids = useMemo(() => idsKey.split("\u0001").filter(Boolean), [idsKey]);

  const queries = useQueries({
    queries: ids.map((sessionId) => ({
      queryKey: ["sessionClosure", sessionId] as const,
      enabled: Boolean(sessionId) && supabaseConfigured,
      queryFn: async (): Promise<string | null> => {
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("session_closures")
          .select("closed_at")
          .eq("session_id", sessionId)
          .maybeSingle();
        if (error) {
          console.warn("session_closures 조회 실패:", error.message);
          return null;
        }
        return data?.closed_at ?? null;
      },
    })),
  });

  const closedByRoomId = useMemo(() => {
    const m: Record<string, boolean> = {};
    ids.forEach((id, i) => {
      m[id] = Boolean(queries[i]?.data);
    });
    return m;
  }, [ids, queries]);

  const isLoading = queries.some((q) => q.isPending);
  return { closedByRoomId, isLoading };
}

export function useSessionClosure(sessionId: string) {
  const supabaseConfigured = useCafeSupabaseConfigured();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["sessionClosure", sessionId],
    enabled: Boolean(sessionId) && supabaseConfigured,
    queryFn: async (): Promise<string | null> => {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("session_closures")
        .select("closed_at")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (error) {
        console.warn("session_closures 조회 실패:", error.message);
        return null;
      }
      return data?.closed_at ?? null;
    },
  });

  useEffect(() => {
    if (!sessionId || !supabaseConfigured) return;
    const supabase = createBrowserSupabaseClient();

    const channel = supabase
      .channel(`session-closure-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_closures",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["sessionClosure", sessionId],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient, supabaseConfigured]);

  return query;
}

export function useCloseSessionMutation(sessionId: string) {
  const supabaseConfigured = useCafeSupabaseConfigured();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!supabaseConfigured) {
        throw new Error("Supabase 가 설정되어 있어야 마감할 수 있어요.");
      }
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("session_closures").upsert(
        {
          session_id: sessionId,
          closed_at: new Date().toISOString(),
        },
        { onConflict: "session_id" },
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sessionClosure", sessionId],
      });
    },
  });
}
