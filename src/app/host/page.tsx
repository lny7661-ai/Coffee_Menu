import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { HostRoomSection } from "@/components/host-room-section";
import { HostSavedSessionsList } from "@/components/host-saved-sessions-list";

/** 요청마다 env 를 읽어 `.env.local` 의 서버 키가 정적 HTML 에 박히지 않게 합니다. */
export const dynamic = "force-dynamic";

export default function HostPage() {
  return (
    <MobileShell>
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-white/75">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="홈으로"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              주최자
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">방 · 공유 · 취합</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <HostSavedSessionsList />
        <HostRoomSection />
      </main>
    </MobileShell>
  );
}
