import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { HostRoomSection } from "@/components/host-room-section";

export default function HostPage() {
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
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800/80">
              주최자
            </p>
            <h1 className="text-lg font-semibold text-stone-900">메뉴 · 공유</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-stone-800">
            <PencilLine className="h-5 w-5 text-amber-700" />
            <h2 className="font-semibold">메뉴 편집</h2>
          </div>
          <p className="mt-2 text-sm text-stone-600">
            공유 전 음료 이름과 가격을 수정할 수 있어요. (추가 예정)
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            메뉴 수정하기
          </button>
        </section>

        <HostRoomSection />
      </main>
    </MobileShell>
  );
}
