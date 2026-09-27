import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice } from "@/components/Cards";
import { getCurrentUser } from "@/lib/auth";
import { getAdminData, listApprovedSkinsForPicker } from "@/lib/data";
import {
  moderateCaseAction,
  moderatePostAction,
  moderateSkinAction,
  updateCaseContentsAction,
  updateUserAction,
} from "@/lib/actions";
import { formatDate, money, rarity, roleLabel, statusInfo } from "@/lib/ui";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "overview", label: "Обзор" },
  { key: "skins", label: "Скины" },
  { key: "cases", label: "Кейсы" },
  { key: "posts", label: "Блог" },
  { key: "users", label: "Пользователи" },
];

function DecisionForm({
  action,
  id,
  note,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  note?: string;
}) {
  return (
    <form action={action} className="mt-4 space-y-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="note"
        defaultValue={note ?? ""}
        className="field"
        placeholder="Комментарий модератора (необязательно)"
      />
      <div className="flex flex-wrap gap-2">
        <button type="submit" name="decision" value="approved" className="btn btn-lime !py-2">
          ✓ Опубликовать
        </button>
        <button type="submit" name="decision" value="rejected" className="btn btn-danger !py-2">
          ✕ Отклонить
        </button>
      </div>
    </form>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="panel clip-corner p-10 text-center">
          <p className="display text-3xl text-white">Доступ запрещён</p>
          <p className="mt-3 text-sm text-slate-400">
            Панель модерации доступна только администраторам. Ваша роль: {roleLabel(user.role)}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard" className="btn btn-ghost">Мой кабинет</Link>
            <Link href="/studio" className="btn btn-primary">Студия автора</Link>
          </div>
        </div>
      </div>
    );
  }

  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "overview";
  const [data, picker] = await Promise.all([getAdminData(), listApprovedSkinsForPicker()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label">Панель администратора</p>
          <h1 className="display text-4xl text-white sm:text-5xl">Модерация SkinForge</h1>
          <p className="mt-2 text-sm text-slate-400">
            Публикация скинов, кейсов и статей, управление ролями и балансами пользователей.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/skins" className="btn btn-ghost">Каталог</Link>
          <Link href="/blog" className="btn btn-ghost">Блог</Link>
        </div>
      </div>

      {sp.error ? <div className="mt-6"><Notice tone="error">{sp.error}</Notice></div> : null}
      {sp.saved ? <div className="mt-6"><Notice tone="ok">Решение сохранено</Notice></div> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["В очереди", data.stats.pendingTotal, "#f5c451"],
          ["Скинов опубликовано", data.stats.skinsTotal, "#4ade80"],
          ["Кейсов", data.stats.casesTotal, "#29e7ff"],
          ["Статей", data.stats.postsTotal, "#b6ff3d"],
          ["Пользователей", data.stats.usersTotal, "#7c5cff"],
          ["Заказов", data.stats.ordersTotal, "#ff9a3c"],
          ["Оборот", money(data.stats.revenue), "#b6ff3d"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="panel clip-corner p-5" style={{ borderTop: `2px solid ${String(color)}` }}>
            <p className="mono-label">{String(label)}</p>
            <p className="display mt-1 text-3xl text-white">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-6 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.key}
            href={`/admin?tab=${item.key}`}
            className={`border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest transition ${
              tab === item.key ? "border-neon bg-neon/20 text-white" : "border-line text-slate-400 hover:text-white"
            }`}
          >
            {item.label}
            {item.key === "skins" && data.pendingSkins.filter((s) => s.status === "pending").length > 0 ? (
              <span className="ml-2 text-[#f5c451]">{data.pendingSkins.filter((s) => s.status === "pending").length}</span>
            ) : null}
            {item.key === "cases" && data.pendingCases.filter((c) => c.status === "pending").length > 0 ? (
              <span className="ml-2 text-[#f5c451]">{data.pendingCases.filter((c) => c.status === "pending").length}</span>
            ) : null}
            {item.key === "posts" && data.pendingPosts.filter((p) => p.status === "pending").length > 0 ? (
              <span className="ml-2 text-[#f5c451]">{data.pendingPosts.filter((p) => p.status === "pending").length}</span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* ------------------------------------------------------ OVERVIEW */}
      {tab === "overview" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: "Скины на модерации", items: data.pendingSkins.filter((s) => s.status === "pending"), href: "/admin?tab=skins" },
            { title: "Кейсы на модерации", items: data.pendingCases.filter((c) => c.status === "pending"), href: "/admin?tab=cases" },
            { title: "Статьи на модерации", items: data.pendingPosts.filter((p) => p.status === "pending"), href: "/admin?tab=posts" },
          ].map((queue) => (
            <div key={queue.title} className="panel clip-corner p-5">
              <div className="flex items-center justify-between">
                <p className="mono-label">{queue.title}</p>
                <Link href={queue.href} className="font-mono text-[0.62rem] uppercase tracking-widest text-cyan">
                  открыть →
                </Link>
              </div>
              <p className="display mt-2 text-4xl text-white">{queue.items.length}</p>
              <ul className="mt-3 space-y-1.5">
                {queue.items.slice(0, 5).map((item) => (
                  <li key={item.id} className="truncate font-mono text-xs text-slate-400">
                    · {item.title}
                  </li>
                ))}
                {queue.items.length === 0 ? <li className="font-mono text-xs text-lime">очередь пуста</li> : null}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {/* --------------------------------------------------------- SKINS */}
      {tab === "skins" ? (
        <div className="space-y-4">
          {data.pendingSkins.length === 0 ? (
            <div className="panel clip-corner p-8 text-center text-sm text-slate-400">Очередь пуста.</div>
          ) : (
            data.pendingSkins.map((skin) => {
              const r = rarity(skin.rarity);
              const image = skin.imageMediaId ? `/api/media/${skin.imageMediaId}` : skin.imageUrl;
              return (
                <div key={skin.id} className="panel clip-corner grid gap-5 p-5 md:grid-cols-[200px_1fr]">
                  <div className="border border-line bg-void/60">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={skin.title} className="aspect-4/3 w-full object-cover" />
                    ) : (
                      <div className="grid aspect-4/3 place-items-center font-mono text-[0.6rem] text-slate-600">нет картинки</div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 font-mono text-[0.58rem] font-bold uppercase tracking-widest text-void" style={{ background: r.color }}>
                        {r.label}
                      </span>
                      <span className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: statusInfo(skin.status).color }}>
                        ● {statusInfo(skin.status).label}
                      </span>
                      <span className="font-mono text-xs text-lime">{money(skin.price)}</span>
                      <span className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                        автор: {skin.authorName ?? "—"} · {formatDate(skin.createdAt)}
                      </span>
                    </div>
                    <h3 className="display mt-2 text-2xl text-white">{skin.title}</h3>
                    <p className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                      {skin.weapon} · {skin.exterior} · float {skin.floatValue || "—"} · {skin.gameTitle ?? "игра не указана"}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{skin.description}</p>
                    <DecisionForm action={moderateSkinAction} id={skin.id} note={skin.reviewNote} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {/* --------------------------------------------------------- CASES */}
      {tab === "cases" ? (
        <div className="space-y-4">
          {data.pendingCases.length === 0 ? (
            <div className="panel clip-corner p-8 text-center text-sm text-slate-400">Очередь пуста.</div>
          ) : (
            data.pendingCases.map((box) => (
              <div key={box.id} className="panel clip-corner p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="display text-2xl text-white">{box.title}</h3>
                  <span className="font-mono text-xs text-lime">{money(box.price)}</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: statusInfo(box.status).color }}>
                    ● {statusInfo(box.status).label}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                    {box.itemCount} предметов · автор: {box.authorName ?? "—"}
                  </span>
                </div>
                <p className="mt-2 max-w-3xl text-sm text-slate-300">{box.description}</p>
                <DecisionForm action={moderateCaseAction} id={box.id} note={box.reviewNote} />

                <details className="mt-4 border border-line bg-void/50 p-3">
                  <summary className="cursor-pointer font-mono text-[0.62rem] uppercase tracking-widest text-cyan">
                    Наполнить кейс ({box.itemCount} позиций)
                  </summary>
                  <form action={updateCaseContentsAction} className="mt-3 space-y-3">
                    <input type="hidden" name="caseId" value={box.id} />
                    <div className="max-h-56 space-y-1.5 overflow-y-auto">
                      {picker.map((skin) => (
                        <label key={skin.id} className="flex items-center gap-2 font-mono text-xs text-slate-300">
                          <input type="checkbox" name="skinIds" value={skin.id} className="accent-[#7c5cff]" />
                          <span className="truncate">{skin.title}</span>
                          <span className="ml-auto text-lime">{money(skin.price)}</span>
                        </label>
                      ))}
                    </div>
                    <button type="submit" className="btn btn-ghost !py-2">Сохранить содержимое</button>
                  </form>
                </details>
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* --------------------------------------------------------- POSTS */}
      {tab === "posts" ? (
        <div className="space-y-4">
          {data.pendingPosts.length === 0 ? (
            <div className="panel clip-corner p-8 text-center text-sm text-slate-400">Очередь пуста.</div>
          ) : (
            data.pendingPosts.map((post) => (
              <div key={post.id} className="panel clip-corner p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="display text-2xl text-white">{post.title}</h3>
                  <span className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: statusInfo(post.status).color }}>
                    ● {statusInfo(post.status).label}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                    автор: {post.authorName ?? "—"} · {formatDate(post.createdAt)}
                  </span>
                  <Link href={`/blog/${post.slug}`} className="ml-auto font-mono text-[0.62rem] uppercase tracking-widest text-cyan">
                    предпросмотр →
                  </Link>
                </div>
                <p className="mt-2 text-sm text-slate-400">{post.excerpt}</p>
                <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-line border border-line bg-void/50 p-3 text-sm leading-relaxed text-slate-300">
                  {post.body}
                </p>
                <DecisionForm action={moderatePostAction} id={post.id} note={post.reviewNote} />
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* --------------------------------------------------------- USERS */}
      {tab === "users" ? (
        <div className="panel clip-corner overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <p className="mono-label">Пользователи и права ({data.users.length})</p>
          </div>
          <div className="divide-y divide-line">
            {data.users.map((row) => (
              <div key={row.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center bg-gradient-to-br from-neon to-ember font-mono text-xs font-black text-void">
                    {row.username.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="display text-lg text-white">{row.username}</p>
                    <p className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                      {row.email} · с {formatDate(row.createdAt)} ·{" "}
                      <span className={row.status === "banned" ? "text-[#ff98a2]" : "text-lime"}>
                        {row.status === "banned" ? "заблокирован" : "активен"}
                      </span>
                    </p>
                  </div>
                  <span className="ml-auto font-mono text-sm text-lime">{money(row.balance)}</span>
                </div>

                {row.id === user.id ? (
                  <span className="self-center font-mono text-[0.62rem] uppercase tracking-widest text-cyan">
                    это ваш аккаунт · {roleLabel(row.role)}
                  </span>
                ) : (
                  <form action={updateUserAction} className="grid gap-2 sm:grid-cols-[110px_120px_130px_auto]">
                    <input type="hidden" name="id" value={row.id} />
                    <select name="role" defaultValue={row.role} className="field !py-1.5 text-xs">
                      <option value="user">Покупатель</option>
                      <option value="author">Автор</option>
                      <option value="admin">Администратор</option>
                    </select>
                    <select name="status" defaultValue={row.status} className="field !py-1.5 text-xs">
                      <option value="active">Активен</option>
                      <option value="banned">Блокировка</option>
                    </select>
                    <input name="balanceDelta" placeholder="± баланс, ₽" className="field !py-1.5 text-xs" />
                    <button type="submit" className="btn btn-primary !py-1.5 !text-[0.6rem]">
                      Применить
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
