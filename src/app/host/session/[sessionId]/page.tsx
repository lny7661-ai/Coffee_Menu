import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { OrdersList } from "@/components/orders-list";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function HostSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <MobileShell>
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-[var(--app-surface)]/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-[var(--app-surface)]/80">
        <div className="flex items-center gap-3">
          <Link
            href="/host"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100"
            aria-label="주최 화면으로"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800/80">
              취합 현황
            </p>
            <h1 className="text-lg font-semibold text-stone-900">참가 메뉴</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 py-6">
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white/80 px-4 py-3 text-sm text-stone-600">
          <Users className="h-5 w-5 shrink-0 text-amber-700" />
          <span>
            세션{" "}
            <span className="font-mono text-stone-800">{sessionId}</span> — 새
            주문이 들어오면 자동으로 갱신됩니다.
          </span>
        </div>

        <OrdersList sessionId={sessionId} />
      </main>
    </MobileShell>
  );
}
