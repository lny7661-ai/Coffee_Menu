"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  MENU_CATALOG,
} from "@/data/menu-catalog";
import {
  cartLineKey,
  formatOrderLine,
  getDefaultOrderOptions,
} from "@/lib/menu";
import type {
  MenuCategory,
  MenuProduct,
  OrderOptions,
} from "@/lib/types/menu-product";
import { MenuOptionSheet } from "@/components/menu-option-sheet";
import { MenuOrderForm } from "@/components/menu-order-form";
import { MenuProductCard } from "@/components/menu-product-card";
import { KakaoLoginGate } from "@/components/kakao-login-gate";
import { useSessionClosure } from "@/hooks/useSessionClosure";
import { useMyOrder } from "@/hooks/useMyOrder";
import {
  loadStoredKakaoProfile,
  type KakaoParticipantProfile,
} from "@/lib/kakao/kakao-auth";

type OrderSessionClientProps = {
  sessionId: string;
};

type CartEntry = {
  key: string;
  product: MenuProduct;
  options: OrderOptions;
  quantity: number;
};

function ExistingOrderSummary({
  nickname,
  menu,
  sessionClosed,
  onEdit,
}: {
  nickname: string;
  menu: string;
  sessionClosed: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/80 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700/90">
        이미 선택한 메뉴
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-800">
        <span className="text-zinc-900">{nickname}</span>
        님이 고르신 메뉴예요.
      </p>
      <div className="mt-4 rounded-xl border border-emerald-100 bg-white px-3 py-3 text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">
        {menu}
      </div>
      {!sessionClosed ? (
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 w-full rounded-xl border border-emerald-600/30 bg-white py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
        >
          메뉴 수정
        </button>
      ) : (
        <p className="mt-4 text-center text-xs text-zinc-500">
          취합이 마감되어 수정할 수 없습니다.
        </p>
      )}
    </div>
  );
}

export function OrderSessionClient({ sessionId }: OrderSessionClientProps) {
  const { data: closedAt } = useSessionClosure(sessionId);
  const sessionClosed = Boolean(closedAt);

  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfile] = useState<KakaoParticipantProfile | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [category, setCategory] = useState<MenuCategory>(CATEGORY_ORDER[0]);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
    null,
  );
  const [orderOptions, setOrderOptions] = useState<OrderOptions>(() =>
    getDefaultOrderOptions(MENU_CATALOG[0]),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cart, setCart] = useState<CartEntry[]>([]);

  useEffect(() => {
    setProfile(loadStoredKakaoProfile());
    setHydrated(true);
  }, []);

  const kakaoId = profile?.id ?? null;
  const { data: myOrder, isLoading: myOrderLoading } = useMyOrder(
    sessionId,
    hydrated ? kakaoId : null,
  );

  const visibleProducts = useMemo(
    () => MENU_CATALOG.filter((p) => p.category === category),
    [category],
  );

  const cartLinesForSubmit = useMemo(
    () =>
      cart.map((c) => ({
        menu: formatOrderLine(c.product, c.options),
        quantity: c.quantity,
      })),
    [cart],
  );

  const canSubmit = cart.length > 0 && cart.some((c) => c.quantity > 0);

  const openProduct = (product: MenuProduct) => {
    if (sessionClosed) return;
    setSelectedProduct(product);
    setOrderOptions(getDefaultOrderOptions(product));
    setSheetOpen(true);
  };

  const addToCartFromSheet = () => {
    if (!selectedProduct) return;
    const key = cartLineKey(selectedProduct, orderOptions);
    setCart((prev) => {
      const i = prev.findIndex((e) => e.key === key);
      if (i === -1) {
        return [
          ...prev,
          {
            key,
            product: selectedProduct,
            options: { ...orderOptions },
            quantity: 1,
          },
        ];
      }
      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + 1 };
      return next;
    });
  };

  const setQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((e) =>
          e.key === key
            ? { ...e, quantity: Math.max(0, e.quantity + delta) }
            : e,
        )
        .filter((e) => e.quantity > 0),
    );
  };

  const removeLine = (key: string) => {
    setCart((prev) => prev.filter((e) => e.key !== key));
  };

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-sm text-zinc-500">불러오는 중…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <KakaoLoginGate
        sessionClosed={sessionClosed}
        onLoggedIn={setProfile}
      />
    );
  }

  if (myOrderLoading) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-sm text-zinc-500">주문 내역을 불러오는 중…</p>
      </div>
    );
  }

  const hasOrder = Boolean(myOrder);
  const showSummary = hasOrder && !editMode;
  /** 수정 모드에서만 기존 행 UPDATE */
  const formExistingId = editMode ? (myOrder?.id ?? null) : null;

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5">
      <p className="text-xs text-zinc-500">
        <span className="font-medium text-zinc-700">{profile.nickname}</span>
        님으로 참여 중
      </p>

      {sessionClosed ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-medium text-zinc-700">
          이 방은 취합이 마감되었습니다. 메뉴는 볼 수 있지만 주문은 제출할 수
          없습니다.
        </p>
      ) : null}

      {showSummary && myOrder ? (
        <ExistingOrderSummary
          nickname={profile.nickname}
          menu={myOrder.menu_item}
          sessionClosed={sessionClosed}
          onEdit={() => {
            setEditMode(true);
            setCart([]);
          }}
        />
      ) : null}

      {!showSummary ? (
        <>
          <p className="text-sm text-zinc-500">
            카테고리를 고른 뒤 메뉴를 눌러 옵션을 고르고 장바구니에 담으세요.
          </p>

          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === cat
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {CATEGORY_LABEL[cat]}
              </button>
            ))}
          </div>

          <ul
            className={`grid grid-cols-2 gap-3 ${sessionClosed ? "pointer-events-none opacity-50" : ""}`}
          >
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <MenuProductCard
                  product={product}
                  onSelect={() => openProduct(product)}
                />
              </li>
            ))}
          </ul>

          {cart.length > 0 && !sessionClosed ? (
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                장바구니
              </p>
              <ul className="mt-3 space-y-3">
                {cart.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-start gap-2 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                  >
                    <p className="min-w-0 flex-1 text-sm font-medium text-zinc-800">
                      {formatOrderLine(line.product, line.options)}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="수량 감소"
                        onClick={() => setQty(line.key, -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                      >
                        <Minus className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums text-zinc-900">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="수량 증가"
                        onClick={() => setQty(line.key, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        aria-label="항목 삭제"
                        onClick={() => removeLine(line.key)}
                        className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <MenuOrderForm
            sessionId={sessionId}
            cartLines={cartLinesForSubmit}
            canSubmit={canSubmit}
            sessionClosed={sessionClosed}
            kakaoId={profile.id}
            kakaoNickname={profile.nickname}
            existingOrderId={formExistingId}
            onSubmitted={() => {
              setEditMode(false);
              setCart([]);
            }}
          />
        </>
      ) : null}

      {selectedProduct ? (
        <MenuOptionSheet
          product={selectedProduct}
          options={orderOptions}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onChange={setOrderOptions}
          onAddToCart={addToCartFromSheet}
        />
      ) : null}
    </div>
  );
}
