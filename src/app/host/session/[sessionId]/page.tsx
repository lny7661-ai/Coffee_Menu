import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { HostSessionBoardTitle } from "@/components/host-session-board-title";
import { HostRoomDashboard } from "@/components/host-room-dashboard";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function HostSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <MobileShell>
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-white/75">
        <div className="flex items-center gap-3">
          <Link
            href="/host"
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="주최 화면으로"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <HostSessionBoardTitle sessionId={sessionId} />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-sm text-zinc-600">
          <Users className="h-5 w-5 shrink-0 text-zinc-400" strokeWidth={2} />
          <span>
            세션{" "}
            <span className="font-mono text-zinc-800">{sessionId}</span> — 새
            주문이 들어오면 자동으로 갱신됩니다.
          </span>
        </div>

        <HostRoomDashboard roomId={sessionId} />
      </main>
    </MobileShell>
  );
}
