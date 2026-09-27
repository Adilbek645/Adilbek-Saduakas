import Link from "next/link";
import { CaseCard, PostCard, SectionTitle, SkinCard } from "@/components/Cards";
import { getCurrentUser } from "@/lib/auth";
import { getSiteStats, listCases, listPosts, listSkins } from "@/lib/data";
import { money, plural } from "@/lib/ui";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    n: "01",
    title: "Регистрация",
    text: "Создаём кабинет покупателя, начисляем 500 ₽ приветственного баланса и открываем инвентарь.",
  },
  {
    n: "02",
    title: "Выбор скина или кейса",
    text: "Фильтруем каталог по игре, редкости и цене. У каждого предмета — описание, float и шансы.",
  },
  {
    n: "03",
    title: "Покупка / открытие",
    text: "Списываем баланс, предмет появляется в инвентаре. Кейс можно открыть с анимацией рулетки.",
  },
  {
    n: "04",
    title: "Контент — по разрешению",
    text: "Скины, кейсы и статьи авторы отправляют на модерацию: публикует только администратор.",
  },
];

export default async function HomePage() {
  const [user, stats, skins, cases, posts] = await Promise.all([
    getCurrentUser(),
    getSiteStats(),
    listSkins({ sort: "popular", limit: 8 }),
    listCases(),
    listPosts("approved", 3),
  ]);

  const top = skins.slice(0, 4);

  return (
    <>
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="grid-lines absolute inset-0 opacity-70" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-neon/25 blur-[110px]" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan/20 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 border border-lime/40 bg-lime/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-lime">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
              {stats.skinsTotal} {plural(stats.skinsTotal, "скин", "скина", "скинов")} в наличии
            </span>

            <h1 className="display mt-6 text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              Кузница
              <br />
              <span className="gradient-text">легендарных</span>
              <br />
              скинов
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400">
              Маркетплейс игровых предметов, кейсы с прозрачными шансами и редакционный блог
              о рынке. Личный кабинет покупателя, студия автора и модерация каждого материала
              администратором — всё в одном месте.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/skins" className="btn btn-primary">
                Открыть каталог
              </Link>
              <Link href="/cases" className="btn btn-ghost">
                Кейсы и рулетка
              </Link>
              {!user && (
                <Link href="/register" className="btn btn-lime">
                  Создать кабинет
                </Link>
              )}
            </div>

            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Скинов", stats.skinsTotal],
                ["Кейсов", stats.casesTotal],
                ["Статей", stats.postsTotal],
                ["Трейдеров", stats.traders],
              ].map(([label, value]) => (
                <div key={String(label)} className="border-l border-line pl-3">
                  <dt className="mono-label">{label}</dt>
                  <dd className="display text-3xl text-white">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="panel panel-glow clip-corner p-5">
              <div className="flex items-center justify-between">
                <p className="mono-label">Drop of the day</p>
                <span className="font-mono text-[0.62rem] uppercase tracking-widest text-lime">live</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {top.map((skin, index) => (
                  <div key={skin.id} className={index === 0 ? "col-span-2" : ""}>
                    <SkinCard
                      skin={skin}
                      footer={
                        <Link href={`/skins/${skin.id}`} className="btn btn-primary !px-3 !py-1.5 !text-[0.6rem]">
                          Купить
                        </Link>
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rotate-[-6deg] border border-line bg-panel px-4 py-3 font-mono text-[0.65rem] uppercase tracking-widest text-cyan shadow-2xl sm:block">
              шансы открыты · без скрытых комиссий
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- TICKER */}
      <section className="overflow-hidden border-b border-line bg-panel/60 py-3">
        <div className="ticker-track gap-10">
          {[...skins, ...skins].map((skin, i) => (
            <span
              key={`${skin.id}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-widest text-slate-400"
            >
              <span className="text-lime">▲</span>
              {skin.title}
              <span className="text-white">{money(skin.price)}</span>
              <span className="text-slate-700">/</span>
            </span>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- SKINS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle
          kicker="Каталог"
          title="Свежие поступления"
          action={
            <Link href="/skins" className="btn btn-ghost">
              Весь каталог →
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skins.slice(0, 8).map((skin) => (
            <SkinCard key={skin.id} skin={skin} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- CASES */}
      <section className="border-y border-line bg-panel/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle
            kicker="Рулетка"
            title="Кейсы недели"
            action={
              <Link href="/cases" className="btn btn-ghost">
                Все кейсы →
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((box) => (
              <CaseCard key={box.id} box={box} />
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- HOW IT WORKS */}
      <section id="market" className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle kicker="Как это работает" title="Четыре шага до инвентаря мечты" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="panel clip-corner p-5">
              <span className="display text-4xl text-neon/70">{step.n}</span>
              <h3 className="display mt-3 text-xl text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            {
              tag: "Покупатель",
              title: "Личный кабинет покупателя",
              href: "/dashboard",
              text: "Баланс и пополнение, история заказов, инвентарь с продажей предметов обратно в магазин, избранное и профиль.",
            },
            {
              tag: "Автор",
              title: "Студия автора",
              href: "/studio",
              text: "Загрузка скинов, кейсов и статей: картинки, видео и файлы-вложения. Всё уходит на модерацию администратору.",
            },
            {
              tag: "Администратор",
              title: "Панель модерации",
              href: "/admin",
              text: "Одобрение или отклонение каждого материала с комментарием, управление ролями и балансами пользователей.",
            },
          ].map((card) => (
            <Link key={card.tag} href={card.href} className="panel clip-corner skin-card hover-shine block p-6">
              <span className="border border-cyan/40 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-cyan">
                {card.tag}
              </span>
              <h3 className="display mt-4 text-2xl text-white">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.text}</p>
              <span className="mt-4 inline-block font-mono text-[0.65rem] uppercase tracking-widest text-lime">
                Перейти →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- BLOG */}
      <section className="border-t border-line bg-panel/40 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionTitle
            kicker="Редакция"
            title="Блог о рынке скинов"
            action={
              <Link href="/blog" className="btn btn-ghost">
                Все статьи →
              </Link>
            }
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
