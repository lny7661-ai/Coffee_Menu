import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { HostRoomSection } from "@/components/host-room-section";

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
            <h1 className="text-lg font-semibold text-zinc-900">메뉴 · 공유</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-zinc-800">
            <PencilLine className="h-5 w-5 text-zinc-500" strokeWidth={2} />
            <h2 className="font-semibold">메뉴 편집</h2>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            공유 전 음료 이름과 가격을 수정할 수 있어요. (추가 예정)
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            메뉴 수정하기
          </button>
        </section>

        <HostRoomSection />
      </main>
    </MobileShell>
  );
}
