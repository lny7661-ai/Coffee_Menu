import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { OrderSessionClient } from "@/components/order-session-client";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function OrderPage({ params }: PageProps) {
  const { sessionId } = await params;

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
              참가자
            </p>
            <h1 className="text-lg font-semibold text-zinc-900">메뉴 선택</h1>
          </div>
        </div>
      </header>

      <OrderSessionClient sessionId={sessionId} />
    </MobileShell>
  );
}
