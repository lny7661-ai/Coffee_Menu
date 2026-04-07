"use client";

import { useQuery, useQueryClient, useMutation, useQueries } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useCafeSupabaseConfigured } from "@/lib/cafe/cafe-runtime-context";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function stableSortedRoomIdsKey(roomIds: string[]): string {
  return [...new Set(roomIds.filter(Boolean))].sort().join("\u0001");
}

function logSessionClosureError(context: string, err: unknown): void {
  const e = err as { message?: string; code?: string; details?: string };
  const msg = typeof e?.message === "string" ? e.message : String(err);
  if (
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("Could not find the table") ||
    e?.code === "42P01" ||
    e?.code === "PGRST205"
  ) {
    console.warn(
      `[${context}] session_closures 테이블/컬럼이 없거나 스키마와 맞지 않을 수 있습니다. supabase/migrations/002_session_closures.sql(또는 006) 적용을 확인하세요.`,
      msg,
    );
    return;
  }
  console.warn(`[${context}] session_closures:`, msg);
}

async function fetchSessionClosedAt(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("session_closures")
      .select("closed_at")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      logSessionClosureError("조회", error);
      return null;
    }
    return data?.closed_at ?? null;
  } catch (e) {
    logSessionClosureError("조회(예외)", e);
    return null;
  }
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
        try {
          const supabase = createBrowserSupabaseClient();
          return await fetchSessionClosedAt(supabase, sessionId);
        } catch (e) {
          logSessionClosureError("useSessionClosuresMap", e);
          return null;
        }
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
      try {
        const supabase = createBrowserSupabaseClient();
        return await fetchSessionClosedAt(supabase, sessionId);
      } catch (e) {
        logSessionClosureError("useSessionClosure", e);
        return null;
      }
    },
  });

  useEffect(() => {
    if (!sessionId || !supabaseConfigured) return;

    let supabase: SupabaseClient;
    try {
      supabase = createBrowserSupabaseClient();
    } catch (e) {
      logSessionClosureError("realtime(createClient)", e);
      return;
    }

    let channel: ReturnType<SupabaseClient["channel"]> | null = null;
    try {
      channel = supabase
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
        .subscribe((status, err) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn(
              "[session_closures realtime]",
              status,
              err ?? "(no detail)",
            );
          }
        });
    } catch (e) {
      logSessionClosureError("realtime(subscribe)", e);
      return;
    }

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
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
      let supabase: SupabaseClient;
      try {
        supabase = createBrowserSupabaseClient();
      } catch (e) {
        logSessionClosureError("마감(createClient)", e);
        throw e instanceof Error
          ? e
          : new Error("Supabase 클라이언트를 만들 수 없습니다.");
      }

      try {
        const { error } = await supabase.from("session_closures").upsert(
          {
            session_id: sessionId,
            closed_at: new Date().toISOString(),
          },
          { onConflict: "session_id" },
        );
        if (error) {
          logSessionClosureError("마감(upsert)", error);
          throw new Error(
            error.message || "취합 마감 저장에 실패했습니다. 테이블·권한을 확인하세요.",
          );
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes("취합 마감")) throw e;
        logSessionClosureError("마감(예외)", e);
        throw e instanceof Error
          ? e
          : new Error("취합 마감 중 오류가 발생했습니다.");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sessionClosure", sessionId],
      });
    },
  });
}
