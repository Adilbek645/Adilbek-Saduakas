import Link from "next/link";
import { redirect } from "next/navigation";
import UploadField from "@/components/UploadField";
import { Notice, SkinCard } from "@/components/Cards";
import { getCurrentUser } from "@/lib/auth";
import { getStudioData, listApprovedSkinsForPicker, listGames } from "@/lib/data";
import {
  deleteSubmissionAction,
  submitCaseAction,
  submitPostAction,
  submitSkinAction,
} from "@/lib/actions";
import { EXTERIORS, RARITIES, formatDate, money, statusInfo } from "@/lib/ui";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "skin", label: "＋ Скин" },
  { key: "case", label: "＋ Кейс" },
  { key: "post", label: "＋ Статья" },
  { key: "mine", label: "Мои материалы" },
];

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "skin";

  const [games, picker, mine] = await Promise.all([
    listGames(),
    listApprovedSkinsForPicker(),
    getStudioData(user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label">Студия автора</p>
          <h1 className="display text-4xl text-white sm:text-5xl">Добавить материал</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Загружайте скины, кейсы и статьи блога: картины, видео и файлы-вложения. Всё
            отправляется на проверку — публикация возможна только после разрешения администратора.
          </p>
        </div>
        <div className="panel clip-corner px-4 py-3 text-right">
          <p className="mono-label">Ваш статус</p>
          <p className="font-mono text-sm text-white">
            {user.role === "admin" ? "администратор" : user.role === "author" ? "автор" : "на проверке"}
          </p>
        </div>
      </div>

      {sp.error ? (
        <div className="mt-6">
          <Notice tone="error">{sp.error}</Notice>
        </div>
      ) : null}
      {sp.saved ? (
        <div className="mt-6">
          <Notice tone="ok">
            Материал отправлен на модерацию:{" "}
            {sp.saved === "skin" ? "скин" : sp.saved === "case" ? "кейс" : "статья"}
          </Notice>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((item) => (
              <Link
                key={item.key}
                href={`/studio?tab=${item.key}`}
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

          {tab === "skin" ? (
            <form action={submitSkinAction} className="panel clip-corner grid gap-4 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="title">Название скина *</label>
                <input id="title" name="title" required className="field mt-1.5" placeholder="AK-47 | Neon Circuit" />
              </div>
              <div>
                <label className="mono-label" htmlFor="weapon">Оружие / предмет</label>
                <input id="weapon" name="weapon" className="field mt-1.5" placeholder="AK-47" />
              </div>
              <div>
                <label className="mono-label" htmlFor="game">Игра</label>
                <select id="game" name="game" className="field mt-1.5">
                  <option value="">Не выбрана</option>
                  {games.map((game) => (
                    <option key={game.slug} value={game.slug}>{game.emoji} {game.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono-label" htmlFor="rarity">Редкость</label>
                <select id="rarity" name="rarity" className="field mt-1.5">
                  {RARITIES.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono-label" htmlFor="exterior">Качество</label>
                <select id="exterior" name="exterior" className="field mt-1.5">
                  {EXTERIORS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono-label" htmlFor="floatValue">Float</label>
                <input id="floatValue" name="floatValue" className="field mt-1.5" placeholder="0.021" />
              </div>
              <div>
                <label className="mono-label" htmlFor="price">Цена, ₽ *</label>
                <input id="price" name="price" required className="field mt-1.5" placeholder="4899" />
              </div>
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="description">Описание</label>
                <textarea id="description" name="description" rows={4} className="field mt-1.5" placeholder="Паттерн, тираж, особенности финиша…" />
              </div>
              <div className="sm:col-span-2">
                <UploadField name="image" label="Картина скина (файл)" />
              </div>
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="imageUrl">…или ссылка на изображение</label>
                <input id="imageUrl" name="imageUrl" className="field mt-1.5" placeholder="https://…" />
              </div>
              <button type="submit" className="btn btn-primary sm:col-span-2">Отправить скин на модерацию</button>
            </form>
          ) : null}

          {tab === "case" ? (
            <form action={submitCaseAction} className="panel clip-corner grid gap-4 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="case-title">Название кейса *</label>
                <input id="case-title" name="title" required className="field mt-1.5" placeholder="Neon Circuit Case" />
              </div>
              <div>
                <label className="mono-label" htmlFor="case-game">Игра</label>
                <select id="case-game" name="game" className="field mt-1.5">
                  <option value="">Не выбрана</option>
                  {games.map((game) => (
                    <option key={game.slug} value={game.slug}>{game.emoji} {game.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mono-label" htmlFor="case-price">Цена открытия, ₽ *</label>
                <input id="case-price" name="price" required className="field mt-1.5" placeholder="349" />
              </div>
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="case-desc">Описание и шансы</label>
                <textarea id="case-desc" name="description" rows={3} className="field mt-1.5" placeholder="Что внутри и почему это интересно…" />
              </div>
              <div className="sm:col-span-2">
                <UploadField name="image" label="Обложка кейса (картина)" />
              </div>
              <div className="sm:col-span-2">
                <p className="mono-label">Содержимое кейса (одобренные скины)</p>
                <div className="mt-1.5 max-h-56 space-y-1.5 overflow-y-auto border border-line bg-void/60 p-3">
                  {picker.map((skin) => (
                    <label key={skin.id} className="flex items-center gap-2 font-mono text-xs text-slate-300">
                      <input type="checkbox" name="skinIds" value={skin.id} className="accent-[#7c5cff]" />
                      <span className="truncate">{skin.title}</span>
                      <span className="ml-auto text-lime">{money(skin.price)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary sm:col-span-2">Отправить кейс на модерацию</button>
            </form>
          ) : null}

          {tab === "post" ? (
            <form action={submitPostAction} className="panel clip-corner grid gap-4 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="post-title">Заголовок *</label>
                <input id="post-title" name="title" required className="field mt-1.5" placeholder="Как формируется цена на редкие скины" />
              </div>
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="excerpt">Краткое описание</label>
                <input id="excerpt" name="excerpt" className="field mt-1.5" placeholder="2–3 предложения для ленты блога" />
              </div>
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="body">Текст статьи *</label>
                <textarea id="body" name="body" rows={9} required className="field mt-1.5" placeholder="Абзацы разделяйте пустой строкой…" />
              </div>
              <div>
                <label className="mono-label" htmlFor="tags">Теги (через запятую)</label>
                <input id="tags" name="tags" className="field mt-1.5" placeholder="рынок, аналитика" />
              </div>
              <div>
                <label className="mono-label" htmlFor="videoUrl">Видео (YouTube / Vimeo)</label>
                <input id="videoUrl" name="videoUrl" className="field mt-1.5" placeholder="https://youtube.com/watch?v=…" />
              </div>
              <div className="sm:col-span-2">
                <UploadField name="cover" label="Обложка статьи (картина)" />
              </div>
              <div className="sm:col-span-2">
                <UploadField
                  name="attachments"
                  label="Вложения к статье"
                  hint="Картинки, видео (MP4/WEBM), PDF, ZIP, TXT · до 6 МБ на файл"
                  accept="image/*,video/*,.pdf,.zip,.txt,.md"
                  multiple
                />
              </div>
              <div>
                <label className="mono-label" htmlFor="externalUrl">Вложение по ссылке</label>
                <input id="externalUrl" name="externalUrl" className="field mt-1.5" placeholder="https://…" />
              </div>
              <div>
                <label className="mono-label" htmlFor="externalKind">Тип вложения</label>
                <select id="externalKind" name="externalKind" className="field mt-1.5">
                  <option value="image">Картина</option>
                  <option value="video">Видео</option>
                  <option value="file">Файл</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mono-label" htmlFor="externalTitle">Подпись к вложению</label>
                <input id="externalTitle" name="externalTitle" className="field mt-1.5" placeholder="График динамики цен" />
              </div>
              <button type="submit" className="btn btn-primary sm:col-span-2">Отправить статью на модерацию</button>
            </form>
          ) : null}

          {tab === "mine" ? (
            <div className="space-y-6">
              <div className="panel clip-corner p-5">
                <p className="mono-label">Мои скины ({mine.mySkins.length})</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {mine.mySkins.map((skin) => (
                    <div key={skin.id} className="space-y-2">
                      <SkinCard skin={skin} />
                      <form action={deleteSubmissionAction}>
                        <input type="hidden" name="id" value={skin.id} />
                        <input type="hidden" name="kind" value="skin" />
                        <button type="submit" className="btn btn-danger w-full !py-1.5 !text-[0.6rem]">
                          Удалить
                        </button>
                      </form>
                    </div>
                  ))}
                  {mine.mySkins.length === 0 ? (
                    <p className="text-sm text-slate-400">Вы ещё не отправляли скины.</p>
                  ) : null}
                </div>
              </div>

              <div className="panel clip-corner p-5">
                <p className="mono-label">Мои кейсы ({mine.myCases.length})</p>
                <div className="mt-4 space-y-2">
                  {mine.myCases.map((box) => (
                    <div key={box.id} className="flex flex-wrap items-center gap-3 border border-line bg-void/50 p-3">
                      <span className="display text-lg text-white">{box.title}</span>
                      <span className="font-mono text-xs text-lime">{money(box.price)}</span>
                      <span className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: statusInfo(box.status).color }}>
                        ● {statusInfo(box.status).label}
                      </span>
                      <span className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                        {box.itemCount} предметов · {formatDate(box.createdAt)}
                      </span>
                      <form action={deleteSubmissionAction} className="ml-auto">
                        <input type="hidden" name="id" value={box.id} />
                        <input type="hidden" name="kind" value="case" />
                        <button type="submit" className="btn btn-danger !px-3 !py-1 !text-[0.6rem]">Удалить</button>
                      </form>
                    </div>
                  ))}
                  {mine.myCases.length === 0 ? (
                    <p className="text-sm text-slate-400">Кейсы не отправлялись.</p>
                  ) : null}
                </div>
              </div>

              <div className="panel clip-corner p-5">
                <p className="mono-label">Мои статьи ({mine.myPosts.length})</p>
                <div className="mt-4 space-y-2">
                  {mine.myPosts.map((post) => (
                    <div key={post.id} className="border border-line bg-void/50 p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link href={`/blog/${post.slug}`} className="display text-lg text-white hover:text-cyan">
                          {post.title}
                        </Link>
                        <span className="font-mono text-[0.62rem] uppercase tracking-widest" style={{ color: statusInfo(post.status).color }}>
                          ● {statusInfo(post.status).label}
                        </span>
                        <span className="font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                          👁 {post.views} · {formatDate(post.createdAt)}
                        </span>
                        <form action={deleteSubmissionAction} className="ml-auto">
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="kind" value="post" />
                          <button type="submit" className="btn btn-danger !px-3 !py-1 !text-[0.6rem]">Удалить</button>
                        </form>
                      </div>
                      {post.reviewNote ? (
                        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-widest text-[#f5c451]">
                          Комментарий модератора: {post.reviewNote}
                        </p>
                      ) : null}
                    </div>
                  ))}
                  {mine.myPosts.length === 0 ? (
                    <p className="text-sm text-slate-400">Статьи не отправлялись.</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          <div className="panel clip-corner p-5">
            <p className="mono-label">Правила модерации</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>1. Материал виден в каталоге только после одобрения администратора.</li>
              <li>2. К кейсу можно подключать исключительно одобренные скины.</li>
              <li>3. Вложения проверяются вручную: до 6 МБ на файл.</li>
              <li>4. Отклонённый материал можно исправить и отправить повторно.</li>
            </ul>
          </div>
          <div className="panel clip-corner p-5">
            <p className="mono-label">Статистика отправок</p>
            <div className="mt-3 space-y-2 font-mono text-xs">
              {(["pending", "approved", "rejected"] as const).map((key) => {
                const count =
                  mine.mySkins.filter((s) => s.status === key).length +
                  mine.myCases.filter((c) => c.status === key).length +
                  mine.myPosts.filter((p) => p.status === key).length;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span style={{ color: statusInfo(key).color }}>● {statusInfo(key).label}</span>
                    <span className="text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
