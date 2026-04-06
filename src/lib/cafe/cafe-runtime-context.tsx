"use client";

import { createContext, useContext, type ReactNode } from "react";

const CafeRuntimeContext = createContext<{ supabaseConfigured: boolean }>({
  supabaseConfigured: false,
});

export function CafeRuntimeProvider({
  supabaseConfigured,
  children,
}: {
  supabaseConfigured: boolean;
  children: ReactNode;
}) {
  return (
    <CafeRuntimeContext.Provider value={{ supabaseConfigured }}>
      {children}
    </CafeRuntimeContext.Provider>
  );
}

/** 서버(RootLayout)가 읽은 공개 Supabase 설정과 동일한 “설정됨” 여부 — SSR/CSR 일치 */
export function useCafeSupabaseConfigured(): boolean {
  return useContext(CafeRuntimeContext).supabaseConfigured;
}
