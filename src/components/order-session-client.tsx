"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PartyPopper } from "lucide-react";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  MENU_CATALOG,
} from "@/data/menu-catalog";
import { formatCustomOrderLine, formatOrderLine, getDefaultOrderOptions } from "@/lib/menu";
import type {
  MenuCategory,
  MenuProduct,
  OrderOptions,
} from "@/lib/types/menu-product";
import { MenuOptionSheet } from "@/components/menu-option-sheet";
import { MenuOrderForm } from "@/components/menu-order-form";
import { MenuProductCard } from "@/components/menu-product-card";

type OrderSessionClientProps = {
  sessionId: string;
};

export function OrderSessionClient({ sessionId }: OrderSessionClientProps) {
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState<MenuCategory>(CATEGORY_ORDER[0]);
  const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(
    null,
  );
  const [orderOptions, setOrderOptions] = useState<OrderOptions>(() =>
    getDefaultOrderOptions(MENU_CATALOG[0]),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customDetail, setCustomDetail] = useState("");

  const visibleProducts = useMemo(
    () => MENU_CATALOG.filter((p) => p.category === category),
    [category],
  );

  const orderLine = useMemo(() => {
    if (customMode) {
      return formatCustomOrderLine(customDetail);
    }
    if (selectedProduct) {
      return formatOrderLine(selectedProduct, orderOptions);
    }
    return "";
  }, [customMode, customDetail, selectedProduct, orderOptions]);

  const canSubmit = useMemo(() => {
    if (customMode) return customDetail.trim().length > 0;
    return selectedProduct !== null;
  }, [customMode, customDetail, selectedProduct]);

  const openProduct = (product: MenuProduct) => {
    setCustomMode(false);
    setCustomDetail("");
    setSelectedProduct(product);
    setOrderOptions(getDefaultOrderOptions(product));
    setSheetOpen(true);
  };

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80">
          <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">선택 완료</h2>
          <p className="mt-2 text-sm text-zinc-500">
            주문이 전달되었습니다. 창을 닫아도 됩니다.
          </p>
        </div>
        <PartyPopper className="h-8 w-8 text-zinc-300" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5">
      <p className="text-sm text-zinc-500">
        카테고리를 고른 뒤 메뉴를 눌러 옵션을 선택하세요. 메뉴판에 없으면 하단에서
        직접 적을 수 있어요.
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

      <ul className="grid grid-cols-2 gap-3">
        {visibleProducts.map((product) => (
          <li key={product.id}>
            <MenuProductCard
              product={product}
              onSelect={() => openProduct(product)}
            />
          </li>
        ))}
      </ul>

      {selectedProduct && !customMode ? (
        <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 px-4 py-3">
          <p className="text-xs font-medium text-zinc-400">선택한 메뉴</p>
          <p className="mt-1 text-sm font-medium text-zinc-800">{orderLine}</p>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-2 text-sm font-semibold text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
          >
            옵션 변경
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => {
            setCustomMode(true);
            setSelectedProduct(null);
            setSheetOpen(false);
          }}
          className={`text-sm font-semibold ${
            customMode ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {customMode ? "직접 입력 중" : "메뉴판에 없는 주문"}
        </button>
        {customMode ? (
          <textarea
            value={customDetail}
            onChange={(e) => setCustomDetail(e.target.value)}
            placeholder="원하는 메뉴를 적어 주세요"
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
          />
        ) : null}
      </div>

      <MenuOrderForm
        sessionId={sessionId}
        orderLine={orderLine}
        canSubmit={canSubmit}
        onSubmitted={() => setDone(true)}
      />

      {selectedProduct ? (
        <MenuOptionSheet
          product={selectedProduct}
          options={orderOptions}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onChange={setOrderOptions}
        />
      ) : null}
    </div>
  );
}
