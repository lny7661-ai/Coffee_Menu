import Link from "next/link";
import {
  ClipboardList,
  Coffee,
  ChevronRight,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";

const demoSessionId = "demo";

export default function Home() {
  return (
    <>
      <header className="border-b border-zinc-100 bg-white px-5 pb-10 pt-12">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-700 ring-1 ring-zinc-100">
            <Coffee className="h-7 w-7" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              모바일 퍼스트
            </p>
            <h1 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-zinc-900">
              커피 메뉴 취합
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
              주최자는 메뉴를 정리하고 카카오톡으로 공유하고, 참가자는 링크로
              골라요.
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
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white transition group-hover:bg-zinc-800">
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-zinc-900">주최자로 시작</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                메뉴 수정 · 카카오 공유 · 취합 보기
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
              <p className="font-semibold text-zinc-900">참가자 화면 (예시)</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                데모 세션으로 메뉴 선택 플로우 확인
              </p>
            </div>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-zinc-300 transition group-hover:text-zinc-500"
              strokeWidth={2}
            />
          </Link>

          <Link
            href={`/host/session/${demoSessionId}`}
            className="group flex items-center gap-4 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200/80 transition group-hover:bg-zinc-200/70">
              <Users className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-zinc-900">취합 board (예시)</p>
              <p className="mt-0.5 text-sm text-zinc-500">
                누가 무엇을 골랐는지 한눈에
              </p>
            </div>
            <ChevronRight
              className="h-5 w-5 shrink-0 text-zinc-300 transition group-hover:text-zinc-500"
              strokeWidth={2}
            />
          </Link>
        </section>

        <section className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
            <MessageCircle className="h-4 w-4 text-zinc-500" strokeWidth={2} />
            다음 단계에서 붙일 기능
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-600">
            <li className="flex gap-2.5 pl-0.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
              카카오 JavaScript SDK · 공유 템플릿 연동
            </li>
            <li className="flex gap-2.5 pl-0.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
              세션/선택 상태 저장 (한 번만 선택 → 완료 화면)
            </li>
            <li className="flex gap-2.5 pl-0.5">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
              주최자용 메뉴·가격 편집 UI
            </li>
          </ul>
        </section>
      </main>

      <footer className="mt-auto border-t border-zinc-100 px-4 py-5 text-center text-[11px] text-zinc-400">
        최대 너비 <span className="font-mono text-zinc-500">max-w-lg</span> · 터치
        친화 UI
      </footer>
    </>
  );
}
