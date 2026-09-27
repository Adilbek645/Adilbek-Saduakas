import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice, SkinCard } from "@/components/Cards";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { depositAction, sellItemAction, updateProfileAction } from "@/lib/actions";
import UploadField from "@/components/UploadField";
import { formatDate, money, plural, rarity, roleLabel } from "@/lib/ui";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "overview", label: "Обзор" },
  { key: "inventory", label: "Инвентарь" },
  { key: "orders", label: "Заказы" },
  { key: "favorites", label: "Избранное" },
  { key: "profile", label: "Профиль" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    error?: string;
    saved?: string;
    bought?: string;
    welcome?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "overview";
  const data = await getDashboardData(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label">Личный кабинет покупателя</p>
          <h1 className="display text-4xl text-white sm:text-5xl">Привет, {user.username}</h1>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
            {roleLabel(user.role)} · с {formatDate(user.createdAt)} · {data.inventory.length}{" "}
            {plural(data.inventory.length, "предмет", "предмета", "предметов")} в инвентаре
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/skins" className="btn btn-ghost">
            В каталог
          </Link>
          <Link href="/cases" className="btn btn-primary">
            Открыть кейс
          </Link>
        </div>
      </div>

      {sp.welcome ? (
        <div className="mt-6">
          <Notice tone="ok">Кабинет создан · начислен приветственный баланс 500 ₽</Notice>
        </div>
      ) : null}
      {sp.bought ? (
        <div className="mt-6">
          <Notice tone="ok">Покупка совершена: {sp.bought} · добавлено в инвентарь</Notice>
        </div>
      ) : null}
      {sp.error ? (
        <div className="mt-6">
          <Notice tone="error">{sp.error}</Notice>
        </div>
      ) : null}
      {sp.saved ? (
        <div className="mt-6">
          <Notice tone="ok">Изменения сохранены</Notice>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* -------------------------------------------------- SIDEBAR */}
        <aside className="space-y-5">
          <div className="panel panel-glow clip-corner p-5">
            <p className="mono-label">Баланс</p>
            <p className="display text-4xl text-lime">{money(user.balance)}</p>
            <form action={depositAction} className="mt-4 space-y-3">
              <div>
                <label className="mono-label" htmlFor="amount">
                  Пополнить на
                </label>
                <input
                  id="amount"
                  name="amount"
                  defaultValue="1000"
                  className="field mt-1.5"
                  placeholder="1000"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["500", "1000", "2500", "5000"].map((preset) => (
                  <button
                    key={preset}
                    type="submit"
                    name="amount"
                    value={preset}
                    className="border border-line px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-widest text-slate-300 transition hover:border-lime hover:text-lime"
                  >
                    +{preset} ₽
                  </button>
                ))}
              </div>
              <button type="submit" className="btn btn-lime w-full">
                Пополнить баланс
              </button>
            </form>
          </div>

          <div className="panel clip-corner divide-y divide-line">
            {[
              ["Стоимость инвентаря", money(data.inventoryValue)],
              ["Всего потрачено", money(data.spentTotal)],
              ["Заказов", String(data.orders.length)],
              ["В избранном", String(data.favorites.length)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="mono-label">{label}</span>
                <span className="font-mono text-sm text-white">{value}</span>
              </div>
            ))}
          </div>

          {user.role === "user" ? (
            <div className="panel clip-corner p-5">
              <p className="mono-label">Хотите публиковать материалы?</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Студия автора позволяет отправлять скины, кейсы и статьи с вложениями на проверку
                администратору.
              </p>
              <Link href="/studio" className="btn btn-ghost mt-4 w-full">
                Перейти в студию
              </Link>
            </div>
          ) : null}
        </aside>

        {/* -------------------------------------------------- CONTENT */}
        <section>
          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((item) => (
              <Link
                key={item.key}
                href={`/dashboard?tab=${item.key}`}
                className={`border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest transition ${
                  tab === item.key
                    ? "border-neon bg-neon/20 text-white"
                    : "border-line text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {tab === "overview" ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Куплено предметов", data.inventory.filter((i) => i.source === "purchase").length, "💠"],
                  ["Выпало из кейсов", data.inventory.filter((i) => i.source === "case").length, "🎲"],
                  ["Избранных скинов", data.favorites.length, "★"],
                ].map(([label, value, icon]) => (
                  <div key={String(label)} className="panel clip-corner p-5">
                    <span className="text-2xl">{String(icon)}</span>
                    <p className="display mt-2 text-3xl text-white">{String(value)}</p>
                    <p className="mono-label">{String(label)}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="display mb-4 text-2xl text-white">Последние предметы</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {data.inventory.slice(0, 6).map((item) => (
                    <SkinCard
                      key={item.id}
                      skin={{
                        id: item.skinId,
                        title: item.title,
                        weapon: item.source === "case" ? "из кейса" : "покупка",
                        rarity: item.rarity,
                        exterior: item.exterior,
                        price: item.price,
                        imageUrl: item.imageUrl,
                        imageMediaId: item.imageMediaId,
                      }}
                    />
                  ))}
                  {data.inventory.length === 0 ? (
                    <div className="panel clip-corner p-6 text-sm text-slate-400">
                      Инвентарь пуст — начните с{" "}
                      <Link href="/skins" className="text-cyan underline">
                        каталога скинов
                      </Link>
                      .
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "inventory" ? (
            <div className="space-y-4">
              {data.inventory.length === 0 ? (
                <div className="panel clip-corner p-8 text-center text-sm text-slate-400">
                  Здесь появятся купленные и выпавшие предметы.
                </div>
              ) : (
                data.inventory.map((item) => {
                  const r = rarity(item.rarity);
                  const image = item.imageMediaId ? `/api/media/${item.imageMediaId}` : item.imageUrl;
                  return (
                    <div key={item.id} className="panel clip-corner flex flex-wrap items-center gap-4 p-4">
                      <div className="h-16 w-24 overflow-hidden border border-line bg-void/60">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt={item.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/skins/${item.skinId}`} className="display text-lg text-white hover:text-cyan">
                          {item.title}
                        </Link>
                        <p className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                          <span style={{ color: r.color }}>● {r.label}</span> · {item.exterior} ·{" "}
                          {item.source === "case" ? "выпал из кейса" : "покупка"} · {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-mono text-sm text-lime">{money(item.price)}</p>
                        <form action={sellItemAction}>
                          <input type="hidden" name="itemId" value={item.id} />
                          <button type="submit" className="btn btn-ghost mt-2 !px-3 !py-1.5 !text-[0.6rem]">
                            Продать за {money(Math.round(item.price * 0.7))}
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : null}

          {tab === "orders" ? (
            <div className="panel clip-corner overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <p className="mono-label">История заказов</p>
              </div>
              {data.orders.length === 0 ? (
                <p className="p-6 text-sm text-slate-400">Заказов пока нет.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line font-mono text-[0.6rem] uppercase tracking-widest text-slate-500">
                        <th className="px-5 py-3">№</th>
                        <th className="px-5 py-3">Дата</th>
                        <th className="px-5 py-3">Состав</th>
                        <th className="px-5 py-3">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => (
                        <tr key={order.id} className="border-b border-line/60 last:border-0">
                          <td className="px-5 py-3 font-mono text-xs text-slate-400">#{order.id}</td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-400">{formatDate(order.createdAt)}</td>
                          <td className="px-5 py-3 text-slate-300">{order.items ?? "—"}</td>
                          <td className="px-5 py-3 font-mono text-lime">{money(order.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {tab === "favorites" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.favorites.length === 0 ? (
                <div className="panel clip-corner p-8 text-sm text-slate-400 sm:col-span-2 xl:col-span-3">
                  Отметьте скины звёздочкой в каталоге — они появятся здесь.
                </div>
              ) : (
                data.favorites.map((fav) => (
                  <SkinCard
                    key={fav.id}
                    skin={{
                      id: fav.skinId,
                      title: fav.title,
                      weapon: "избранное",
                      rarity: fav.rarity,
                      exterior: "",
                      price: fav.price,
                      imageUrl: fav.imageUrl,
                      imageMediaId: fav.imageMediaId,
                    }}
                  />
                ))
              )}
            </div>
          ) : null}

          {tab === "profile" ? (
            <div className="panel clip-corner p-6">
              <p className="mono-label">Настройки профиля</p>
              <form action={updateProfileAction} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mono-label" htmlFor="username">
                    Никнейм
                  </label>
                  <input id="username" name="username" defaultValue={user.username} className="field mt-1.5" />
                </div>
                <div>
                  <span className="mono-label">Текущий аватар</span>
                  <div className="mt-1.5 flex items-center gap-3">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="avatar" className="h-12 w-12 border border-line object-cover" />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center bg-gradient-to-br from-neon to-ember font-mono text-sm font-black text-void">
                        {user.username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-500">{user.email}</span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <UploadField name="avatar" label="Загрузить аватар" hint="PNG, JPG, WEBP · до 6 МБ" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mono-label" htmlFor="bio">
                    О себе
                  </label>
                  <textarea id="bio" name="bio" rows={4} defaultValue={user.bio} className="field mt-1.5" />
                </div>
                <button type="submit" className="btn btn-primary sm:col-span-2">
                  Сохранить профиль
                </button>
              </form>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
