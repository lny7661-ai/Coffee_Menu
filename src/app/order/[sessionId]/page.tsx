import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { OrderSessionClient } from "@/components/order-session-client";
import { DEFAULT_MENUS } from "@/lib/default-menus";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function OrderPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <MobileShell>
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-[var(--app-surface)]/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-[var(--app-surface)]/80">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100"
            aria-label="홈으로"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/80">
              참가자
            </p>
            <h1 className="text-lg font-semibold text-stone-900">메뉴 선택</h1>
          </div>
        </div>
      </header>

      <OrderSessionClient sessionId={sessionId} menus={DEFAULT_MENUS} />
    </MobileShell>
  );
}
