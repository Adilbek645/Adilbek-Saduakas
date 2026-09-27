import Link from "next/link";
import { notFound } from "next/navigation";
import CaseOpener from "@/components/CaseOpener";
import { Notice, SkinCard } from "@/components/Cards";
import { getCurrentUser } from "@/lib/auth";
import { getCase } from "@/lib/data";
import { formatDate, money, rarity } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseId = Number.parseInt(id, 10);
  if (!Number.isFinite(caseId)) notFound();

  const box = await getCase(caseId);
  if (!box) notFound();

  const user = await getCurrentUser();
  const image = box.imageMediaId ? `/api/media/${box.imageMediaId}` : box.imageUrl;
  const totalWeight = box.contents.reduce((acc, item) => acc + item.weight, 0) || 1;
  const expectedValue =
    box.contents.reduce((acc, item) => acc + item.price * (item.weight / totalWeight), 0) || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
        <Link href="/" className="hover:text-cyan">Главная</Link>
        <span>/</span>
        <Link href="/cases" className="hover:text-cyan">Кейсы</Link>
        <span>/</span>
        <span className="text-slate-300">{box.title}</span>
      </nav>

      {box.status !== "approved" ? (
        <div className="mb-6">
          <Notice tone="warn">Кейс ещё не прошёл модерацию администратора</Notice>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="panel clip-corner relative overflow-hidden">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={box.title} className="aspect-4/3 w-full object-cover float-slow" />
            ) : null}
          </div>
          <div className="panel clip-corner mt-5 p-5">
            <p className="mono-label">Описание</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{box.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Игра", box.gameTitle ?? "—"],
                ["Предметов", String(box.contents.length)],
                ["Автор", box.authorName ?? "SkinForge"],
                ["Добавлен", formatDate(box.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="border border-line bg-void/50 p-3">
                  <p className="mono-label">{label}</p>
                  <p className="mt-1 font-mono text-sm text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border border-lime/40 bg-lime/5 p-3">
              <p className="mono-label">Ожидаемая ценность</p>
              <p className="font-mono text-lg text-lime">
                {money(Math.round(expectedValue))}{" "}
                <span className="text-slate-500">при цене {money(box.price)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mono-label">{box.gameTitle ?? "Кейс"}</p>
            <h1 className="display text-4xl leading-none text-white sm:text-5xl">{box.title}</h1>
          </div>

          <CaseOpener
            caseId={box.id}
            price={box.price}
            balance={user?.balance ?? 0}
            canOpen={Boolean(user)}
            contents={box.contents.map((item) => ({
              skinId: item.skinId,
              title: item.title,
              rarity: item.rarity,
              image: item.imageMediaId ? `/api/media/${item.imageMediaId}` : item.imageUrl,
            }))}
          />

          <div className="panel clip-corner overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <p className="mono-label">Содержимое и шансы</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line font-mono text-[0.6rem] uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3">Предмет</th>
                    <th className="px-5 py-3">Редкость</th>
                    <th className="px-5 py-3">Цена</th>
                    <th className="px-5 py-3">Шанс</th>
                  </tr>
                </thead>
                <tbody>
                  {box.contents.map((item) => {
                    const r = rarity(item.rarity);
                    const chance = (item.weight / totalWeight) * 100;
                    return (
                      <tr key={item.skinId} className="border-b border-line/60 last:border-0">
                        <td className="px-5 py-3">
                          <Link href={`/skins/${item.skinId}`} className="text-white hover:text-cyan">
                            {item.title}
                          </Link>
                          <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-widest text-slate-600">
                            {item.exterior}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className="px-2 py-0.5 font-mono text-[0.58rem] font-bold uppercase tracking-widest text-void"
                            style={{ background: r.color }}
                          >
                            {r.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-lime">{money(item.price)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-line">
                              <div className="h-full" style={{ width: `${Math.min(chance * 2, 100)}%`, background: r.color }} />
                            </div>
                            <span className="font-mono text-xs text-slate-300">{chance.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="display mb-6 text-3xl text-white">Что может выпасть</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {box.contents.slice(0, 4).map((item) => (
            <SkinCard
              key={item.skinId}
              skin={{
                id: item.skinId,
                title: item.title,
                weapon: "",
                rarity: item.rarity,
                exterior: item.exterior,
                price: item.price,
                imageUrl: item.imageUrl,
                imageMediaId: item.imageMediaId,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
