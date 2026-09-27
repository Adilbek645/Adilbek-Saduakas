"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { openCaseAction } from "@/lib/actions";
import { money, rarity } from "@/lib/ui";
import type { OpenCaseResult } from "@/lib/types";

type ReelItem = {
  skinId: number;
  title: string;
  rarity: string;
  image: string | null;
};

export default function CaseOpener({
  caseId,
  price,
  contents,
  balance,
  canOpen,
}: {
  caseId: number;
  price: number;
  contents: ReelItem[];
  balance: number;
  canOpen: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "rolling" | "done">("idle");
  const [reel, setReel] = useState<ReelItem[]>([]);
  const [result, setResult] = useState<OpenCaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function open() {
    setError(null);
    if (contents.length === 0) {
      setError("Кейс пока пуст");
      return;
    }
    setPhase("rolling");
    setResult(null);
    let response: OpenCaseResult;
    try {
      response = await openCaseAction(caseId);
    } catch {
      setPhase("idle");
      setError("Не удалось открыть кейс");
      return;
    }
    if (!response.ok || !response.drop) {
      setPhase("idle");
      setError(response.message);
      return;
    }
    const drop = response.drop;
    const strip: ReelItem[] = [];
    for (let i = 0; i < 42; i += 1) {
      const pick = contents[Math.floor(Math.random() * contents.length)];
      strip.push({ skinId: pick.skinId, title: pick.title, rarity: pick.rarity, image: pick.image });
    }
    strip[38] = {
      skinId: drop.skinId,
      title: drop.title,
      rarity: drop.rarity,
      image: drop.image,
    };
    setReel(strip);
    window.setTimeout(() => {
      setResult(response);
      setPhase("done");
      startTransition(() => router.refresh());
    }, 2700);
  }

  const items = reel.length > 0 ? reel : contents.slice(0, 12);
  const r = result?.drop ? rarity(result.drop.rarity) : null;

  return (
    <div className="panel clip-corner overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="mono-label">Рулетка кейса</p>
          <p className="font-mono text-sm text-white">
            Стоимость открытия: <span className="text-lime">{money(price)}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="mono-label">Баланс</p>
          <p className="font-mono text-sm text-lime">{money(balance)}</p>
        </div>
      </div>

      <div className="relative h-36 overflow-hidden bg-void/60">
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-16 bg-gradient-to-r from-void to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-void to-transparent" />
        <div className="absolute left-1/2 top-0 z-30 h-full w-0.5 -translate-x-1/2 bg-lime shadow-[0_0_18px_4px_rgba(182,255,61,0.7)]" />

        <div
          className={`flex h-full items-center gap-3 px-3 ${phase === "rolling" ? "rolling" : ""}`}
          style={
            phase === "rolling"
              ? ({ ["--roll-to" as string]: "-78%" } as React.CSSProperties)
              : undefined
          }
        >
          {(phase === "rolling" || phase === "done") && reel.length > 0
            ? reel.map((item, index) => (
                <ReelCard key={`${item.skinId}-${index}`} item={item} />
              ))
            : items.map((item, index) => (
                <ReelCard key={`${item.skinId}-${index}`} item={item} />
              ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
        {phase === "rolling" ? (
          <button type="button" className="btn btn-primary" disabled>
            Определяем дроп…
          </button>
        ) : (
          <button
            type="button"
            onClick={open}
            className="btn btn-primary pulse-ring"
            disabled={!canOpen || pending || balance < price}
          >
            {canOpen ? `Открыть за ${money(price)}` : "Войдите, чтобы открыть"}
          </button>
        )}
        <span className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
          честный рандом · шансы указаны в таблице
        </span>
      </div>

      {error ? (
        <div className="border-t border-[#ff5f6d]/40 bg-[#ff5f6d]/10 px-5 py-3 font-mono text-[0.65rem] uppercase tracking-widest text-[#ff98a2]">
          {error}
        </div>
      ) : null}

      {phase === "done" && result?.drop ? (
        <div className="border-t border-line p-6">
          <p className="mono-label">Ваш дроп</p>
          <div
            className="drop-in mt-3 flex flex-wrap items-center gap-5 border p-4"
            style={{ borderColor: r?.color, background: `${r?.color}14` }}
          >
            <div className="h-24 w-32 overflow-hidden border border-line bg-void/60">
              {result.drop.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.drop.image} alt={result.drop.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <span
                className="px-2 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-void"
                style={{ background: r?.color }}
              >
                {r?.label}
              </span>
              <p className="display mt-2 text-2xl text-white">{result.drop.title}</p>
              <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
                {result.drop.exterior} · рыночная цена {money(result.drop.price)} · шанс {result.drop.chance}%
              </p>
            </div>
            <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-widest text-lime">
              добавлено в инвентарь →
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReelCard({ item }: { item: ReelItem }) {
  const r = rarity(item.rarity);
  return (
    <div
      className="relative flex h-24 w-28 shrink-0 flex-col justify-end overflow-hidden border border-line bg-panel"
      style={{ boxShadow: `inset 0 -3px 0 0 ${r.color}` }}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
      ) : null}
      <span className="relative z-10 truncate bg-void/80 px-1.5 py-1 font-mono text-[0.55rem] uppercase tracking-wider text-white">
        {item.title}
      </span>
    </div>
  );
}
