import Link from "next/link";
import { PostCard, SectionTitle } from "@/components/Cards";
import { listPosts } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [posts, user] = await Promise.all([listPosts("approved", 40), getCurrentUser()]);
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags.split(",").map((t) => t.trim()).filter(Boolean))),
  );
  const filtered = tag ? posts.filter((post) => post.tags.includes(tag)) : posts;
  const [lead, ...rest] = filtered;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle kicker="Редакция SkinForge" title="Блог о скинах и рынке" />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Link
          href="/blog"
          className={`border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest ${
            !tag ? "border-neon bg-neon/20 text-white" : "border-line text-slate-400 hover:text-white"
          }`}
        >
          Все темы
        </Link>
        {allTags.map((item) => (
          <Link
            key={item}
            href={`/blog?tag=${encodeURIComponent(item)}`}
            className={`border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest ${
              tag === item ? "border-neon bg-neon/20 text-white" : "border-line text-slate-400 hover:text-white"
            }`}
          >
            #{item}
          </Link>
        ))}
      </div>

      {!user ? (
        <div className="panel clip-corner mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-xl text-sm text-slate-400">
            Хотите писать в блог? Авторы загружают картины, видео и файлы-вложения, а публикация
            происходит только после разрешения администратора.
          </p>
          <Link href="/studio" className="btn btn-lime">
            Стать автором
          </Link>
        </div>
      ) : null}

      {!lead ? (
        <div className="panel clip-corner p-10 text-center text-sm text-slate-400">
          Статей по этой теме пока нет.
        </div>
      ) : (
        <>
          <PostCard post={lead} />
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
