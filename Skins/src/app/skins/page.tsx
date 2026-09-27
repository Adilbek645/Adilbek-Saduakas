import Link from "next/link";
import { SectionTitle, SkinCard } from "@/components/Cards";
import { listGames, listSkins } from "@/lib/data";
import { RARITIES } from "@/lib/ui";

export const dynamic = "force-dynamic";

const SORTS = [
  { key: "new", label: "Сначала новые" },
  { key: "price-asc", label: "Цена ↑" },
  { key: "price-desc", label: "Цена ↓" },
  { key: "popular", label: "Популярные" },
];

export default async function SkinsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; game?: string; rarity?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const [games, skins] = await Promise.all([
    listGames(),
    listSkins({ q: sp.q, game: sp.game, rarity: sp.rarity, sort: sp.sort, limit: 60 }),
  ]);

  const chip = (active: boolean) =>
    `border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest transition ${
      active
        ? "border-neon bg-neon/20 text-white"
        : "border-line text-slate-400 hover:border-neon/60 hover:text-white"
    }`;

  const qs = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: sp.q, game: sp.game, rarity: sp.rarity, sort: sp.sort, ...patch };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const str = params.toString();
    return str ? `/skins?${str}` : "/skins";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle kicker="Маркетплейс" title={`Каталог скинов · ${skins.length}`} />

      <form className="panel clip-corner mb-8 grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <label className="mono-label" htmlFor="q">
            Поиск
          </label>
          <input
            id="q"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="AK-47, нож, dragon…"
            className="field mt-1.5"
          />
        </div>
        <div>
          <label className="mono-label" htmlFor="game">
            Игра
          </label>
          <select id="game" name="game" defaultValue={sp.game ?? ""} className="field mt-1.5">
            <option value="">Любая игра</option>
            {games.map((game) => (
              <option key={game.slug} value={game.slug}>
                {game.emoji} {game.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mono-label" htmlFor="rarity">
            Редкость
          </label>
          <select id="rarity" name="rarity" defaultValue={sp.rarity ?? ""} className="field mt-1.5">
            <option value="">Любая редкость</option>
            {RARITIES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <select name="sort" defaultValue={sp.sort ?? "new"} className="field mt-1.5">
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Найти
          </button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link href={qs({ game: undefined })} className={chip(!sp.game)}>
          Все игры
        </Link>
        {games.map((game) => (
          <Link key={game.slug} href={qs({ game: game.slug })} className={chip(sp.game === game.slug)}>
            {game.emoji} {game.title}
          </Link>
        ))}
      </div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Link href={qs({ rarity: undefined })} className={chip(!sp.rarity)}>
          Любая редкость
        </Link>
        {RARITIES.map((r) => (
          <Link key={r.key} href={qs({ rarity: r.key })} className={chip(sp.rarity === r.key)}>
            <span className="mr-1.5 inline-block h-2 w-2 align-middle" style={{ background: r.color }} />
            {r.label}
          </Link>
        ))}
      </div>

      {skins.length === 0 ? (
        <div className="panel clip-corner p-10 text-center">
          <p className="display text-2xl text-white">Ничего не найдено</p>
          <p className="mt-2 text-sm text-slate-400">
            Попробуйте изменить фильтры или загляните в{" "}
            <Link className="text-cyan underline" href="/cases">
              кейсы
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skins.map((skin) => (
            <SkinCard key={skin.id} skin={skin} />
          ))}
        </div>
      )}
    </div>
  );
}
