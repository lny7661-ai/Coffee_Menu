import Link from "next/link";
import {
  ClipboardList,
  Coffee,
  MessageCircle,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

const demoSessionId = "demo";

export default function Home() {
  return (
    <>
      <header className="border-b border-stone-200/80 bg-gradient-to-b from-amber-50/90 to-[var(--app-surface)] px-5 pb-8 pt-10">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 shadow-sm ring-1 ring-amber-200/60">
            <Coffee className="h-6 w-6" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm font-medium text-amber-900/90">모바일 퍼스트</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
              커피 메뉴 취합
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              주최자는 메뉴를 정리하고 카카오톡으로 공유하고, 참가자는 링크로 골라요.
            </p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <section className="grid gap-3">
          <Link
            href="/host"
            className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 text-white transition group-hover:bg-amber-800">
              <Share2 className="h-5 w-5" />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-stone-900">주최자로 시작</p>
              <p className="text-sm text-stone-600">메뉴 수정 · 카카오 공유 · 취합 보기</p>
            </div>
            <Sparkles className="h-5 w-5 text-amber-600 opacity-60" />
          </Link>

          <Link
            href={`/order/${demoSessionId}`}
            className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white transition group-hover:bg-emerald-700">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-stone-900">참가자 화면 (예시)</p>
              <p className="text-sm text-stone-600">데모 세션으로 메뉴 선택 플로우 확인</p>
            </div>
          </Link>

          <Link
            href={`/host/session/${demoSessionId}`}
            className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-700 text-white transition group-hover:bg-amber-800">
              <Users className="h-5 w-5" />
            </span>
            <div className="flex-1 text-left">
              <p className="font-semibold text-stone-900">취합 board (예시)</p>
              <p className="text-sm text-stone-600">누가 무엇을 골랐는지 한눈에</p>
            </div>
          </Link>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
            <MessageCircle className="h-4 w-4 text-[#3C1E1E]" />
            다음 단계에서 붙일 기능
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li className="flex gap-2">
              <span className="text-amber-700">·</span>
              카카오 JavaScript SDK · 공유 템플릿 연동
            </li>
            <li className="flex gap-2">
              <span className="text-amber-700">·</span>
              세션/선택 상태 저장 (한 번만 선택 → 완료 화면)
            </li>
            <li className="flex gap-2">
              <span className="text-amber-700">·</span>
              주최자용 메뉴·가격 편집 UI
            </li>
          </ul>
        </section>
      </main>

      <footer className="mt-auto border-t border-stone-200/80 px-4 py-5 text-center text-xs text-stone-500">
        최대 너비 <span className="font-mono">max-w-lg</span> · 터치 친화 UI
      </footer>
    </>
  );
}
