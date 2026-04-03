import Image from "next/image";
import Link from "next/link";
import { ClipboardList, ChevronRight, Share2 } from "lucide-react";
import { RecentRoomsSection } from "@/components/recent-rooms-section";

const demoSessionId = "demo";

export default function Home() {
  return (
    <>
      <header className="border-b border-zinc-300/80 bg-zinc-200 px-5 pb-8 pt-10 text-zinc-900">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-white p-2 shadow-sm ring-1 ring-zinc-200/80">
            <Image
              src="/images/paul-bassett-logo.png"
              alt="Paul Bassett"
              width={269}
              height={188}
              className="h-12 w-auto object-contain object-left"
              priority
            />
          </div>
          <div className="min-w-0 pt-1">
            <h1 className="text-[1.65rem] font-semibold tracking-tight text-zinc-900">
              Paul Bassett Menu
            </h1>
            <p className="mt-1.5 text-xs leading-snug text-zinc-600">
              한화토탈에너지스 대산공장점
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-4 py-6">
        <section className="grid gap-3">
          <Link
            href="/host"
            className="group flex items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-600 text-white transition group-hover:bg-zinc-700">
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-zinc-900">주최자로 시작</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                카카오 공유 · 취합 보기
              </p>
            </div>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-zinc-300 transition group-hover:text-zinc-500"
              strokeWidth={2}
            />
          </Link>

          <Link
            href={`/order/${demoSessionId}`}
            className="group flex items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200/80 transition group-hover:bg-zinc-200/70">
              <ClipboardList className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-zinc-900">참가자 화면</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                실제 참가자와 동일한 주문 화면입니다.
              </p>
            </div>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-zinc-300 transition group-hover:text-zinc-500"
              strokeWidth={2}
            />
          </Link>
        </section>

        <RecentRoomsSection />
      </main>

      <footer className="mt-auto border-t border-zinc-200/90 bg-zinc-100">
        <div className="px-4 py-4 text-center text-[11px] text-zinc-500">
          한화토탈에너지스 대산공장점 · 터치 친화 UI
        </div>
        <div className="border-t border-zinc-200/70 bg-zinc-100/90 px-4 py-1.5 text-center text-[10px] leading-tight text-zinc-400">
          Paul Bassett Menu
        </div>
      </footer>
    </>
  );
}
