import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { favorites, skins } from "@/db/schema";
import { Notice, SkinCard } from "@/components/Cards";
import { getCurrentUser } from "@/lib/auth";
import { buySkinAction, toggleFavoriteAction } from "@/lib/actions";
import { getSkin, listSkins } from "@/lib/data";
import { formatDate, money, rarity } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function SkinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const skinId = Number.parseInt(id, 10);
  if (!Number.isFinite(skinId)) notFound();

  const skin = await getSkin(skinId);
  if (!skin) notFound();

  const user = await getCurrentUser();
  const r = rarity(skin.rarity);
  const image = skin.imageMediaId ? `/api/media/${skin.imageMediaId}` : skin.imageUrl;

  if (skin.status === "approved") {
    await db
      .update(skins)
      .set({ views: sql`${skins.views} + 1` })
      .where(eq(skins.id, skinId));
  }

  const isFavorite = user
    ? (
        await db
          .select({ id: favorites.id })
          .from(favorites)
          .where(and(eq(favorites.userId, user.id), eq(favorites.skinId, skinId)))
          .limit(1)
      ).length > 0
    : false;

  const related = (await listSkins({ game: skin.gameSlug ?? undefined, limit: 5 })).filter(
    (item) => item.id !== skin.id,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
        <Link href="/" className="hover:text-cyan">Главная</Link>
        <span>/</span>
        <Link href="/skins" className="hover:text-cyan">Скины</Link>
        <span>/</span>
        <span className="text-slate-300">{skin.title}</span>
      </nav>

      {error ? (
        <div className="mb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel clip-corner relative overflow-hidden">
          <div className="grid-lines absolute inset-0 opacity-40" />
          <div className="relative aspect-4/3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={skin.title} className="h-full w-full object-contain p-6 float-slow" />
            ) : (
              <div className="grid h-full place-items-center font-mono text-xs text-slate-600">NO PREVIEW</div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: r.color, boxShadow: `0 0 22px 2px ${r.color}` }} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-widest text-void"
              style={{ background: r.color }}
            >
              {r.label}
            </span>
            {skin.gameTitle ? (
              <span className="border border-cyan/40 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-widest text-cyan">
                {skin.gameTitle}
              </span>
            ) : null}
            <span className="mono-label">👁 {skin.views + 1}</span>
          </div>

          <h1 className="display mt-4 text-4xl leading-none text-white sm:text-5xl">{skin.title}</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-500">
            {skin.weapon} · {skin.exterior}
          </p>

          <div className="panel clip-corner mt-6 p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mono-label">Цена</p>
                <p className="display text-4xl text-lime">{money(skin.price)}</p>
              </div>
              <div className="text-right font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
                <p>Продавец: {skin.authorName ?? "SkinForge"}</p>
                <p>В каталоге с {formatDate(skin.createdAt)}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {user ? (
                <form action={buySkinAction}>
                  <input type="hidden" name="skinId" value={skin.id} />
                  <button
                    type="submit"
                    className="btn btn-primary pulse-ring"
                    disabled={skin.status !== "approved"}
                  >
                    Купить за {money(skin.price)}
                  </button>
                </form>
              ) : (
                <Link href={`/login?next=/skins/${skin.id}`} className="btn btn-primary">
                  Войти и купить
                </Link>
              )}
              <form action={toggleFavoriteAction}>
                <input type="hidden" name="skinId" value={skin.id} />
                <button type="submit" className="btn btn-ghost">
                  {isFavorite ? "★ В избранном" : "☆ В избранное"}
                </button>
              </form>
            </div>

            {user ? (
              <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
                Ваш баланс: <span className="text-lime">{money(user.balance)}</span>
                {user.balance < skin.price ? " — недостаточно средств, пополните кабинет" : " — достаточно для покупки"}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Качество", skin.exterior],
              ["Float", skin.floatValue || "—"],
              ["Тип", skin.weapon || "—"],
              ["Редкость", r.label],
            ].map(([label, value]) => (
              <div key={label} className="border border-line bg-panel/60 p-3">
                <p className="mono-label">{label}</p>
                <p className="mt-1 font-mono text-sm text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="mono-label">Описание</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
              {skin.description || "Описание пока не добавлено."}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="display mb-6 text-3xl text-white">Похожие предметы</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((item) => (
              <SkinCard key={item.id} skin={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
