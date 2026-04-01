"use client";

import { useState } from "react";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { CoffeeMenuCard } from "@/components/coffee-menu-card";
import { MenuOrderForm } from "@/components/menu-order-form";
import type { MenuItem } from "@/lib/types";

type OrderSessionClientProps = {
  sessionId: string;
  menus: MenuItem[];
};

export function OrderSessionClient({ sessionId, menus }: OrderSessionClientProps) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-stone-900">선택 완료</h2>
          <p className="mt-2 text-sm text-stone-600">
            주문이 전달되었습니다. 창을 닫아도 됩니다.
          </p>
        </div>
        <PartyPopper className="h-8 w-8 text-amber-500" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <p className="text-sm text-stone-600">
        아래 카드는 메뉴 안내이고, 맨 아래 폼에서 실제 주문을 제출해요.
      </p>

      <ul className="flex flex-col gap-3">
        {menus.map((item) => (
          <li key={item.id}>
            <CoffeeMenuCard item={item} />
          </li>
        ))}
      </ul>

      <MenuOrderForm
        sessionId={sessionId}
        menus={menus}
        onSubmitted={() => setDone(true)}
      />
    </div>
  );
}
