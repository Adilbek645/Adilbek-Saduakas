import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { Notice, PostCard } from "@/components/Cards";
import { getPostBySlug, listPosts } from "@/lib/data";
import { embedUrl, formatDate } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.id, post.id));

  const cover = post.coverMediaId ? `/api/media/${post.coverMediaId}` : post.coverImageUrl;
  const video = embedUrl(post.videoUrl);
  const images = post.attachments.filter((a) => a.kind === "image");
  const videos = post.attachments.filter((a) => a.kind === "video");
  const files = post.attachments.filter((a) => a.kind === "file");
  const others = await listPosts("approved", 4);
  const related = others.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
        <Link href="/" className="hover:text-cyan">Главная</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-cyan">Блог</Link>
        <span>/</span>
        <span className="truncate text-slate-300">{post.title}</span>
      </nav>

      {post.status !== "approved" ? (
        <div className="mb-6">
          <Notice tone="warn">
            Материал на модерации — публикация возможна только после разрешения администратора
          </Notice>
        </div>
      ) : null}

      <header>
        <div className="flex flex-wrap gap-2">
          {post.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="border border-line px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-cyan hover:border-cyan/60"
              >
                #{tag}
              </Link>
            ))}
        </div>
        <h1 className="display mt-4 text-4xl leading-[0.95] text-white sm:text-5xl">{post.title}</h1>
        <p className="mt-3 text-base text-slate-400">{post.excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-line py-3 font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
          <span>✍ {post.authorName ?? "редакция"}</span>
          <span>◷ {formatDate(post.createdAt)}</span>
          <span>👁 {post.views + 1}</span>
          <span className="text-cyan">🖼 {images.length}</span>
          <span className="text-ember">🎬 {videos.length + (video ? 1 : 0)}</span>
          <span className="text-lime">📎 {files.length}</span>
        </div>
      </header>

      {cover ? (
        <div className="panel clip-corner mt-8 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={post.title} className="aspect-video w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-8 space-y-5 text-[0.98rem] leading-relaxed text-slate-300">
        {post.body.split("\n").filter(Boolean).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {video ? (
        <section className="mt-10">
          <h2 className="display mb-4 text-2xl text-white">Видео к материалу</h2>
          <div className="panel clip-corner aspect-video overflow-hidden">
            <iframe
              src={video}
              title={`Видео: ${post.title}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      {images.length > 0 ? (
        <section className="mt-10">
          <h2 className="display mb-4 text-2xl text-white">Галерея</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((item) => (
              <figure key={item.id} className="panel clip-corner overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.mediaId ? `/api/media/${item.mediaId}` : (item.externalUrl ?? "")}
                  alt={item.title}
                  className="aspect-video w-full object-cover"
                />
                <figcaption className="border-t border-line px-4 py-2 font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                  {item.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {videos.length > 0 ? (
        <section className="mt-10">
          <h2 className="display mb-4 text-2xl text-white">Видео-вложения</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((item) => {
              const src = item.mediaId ? `/api/media/${item.mediaId}` : embedUrl(item.externalUrl ?? "");
              return item.mediaId ? (
                <figure key={item.id} className="panel clip-corner overflow-hidden">
                  <video src={src} controls className="aspect-video w-full bg-black" />
                  <figcaption className="border-t border-line px-4 py-2 font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
                    {item.title}
                  </figcaption>
                </figure>
              ) : (
                <figure key={item.id} className="panel clip-corner aspect-video overflow-hidden">
                  <iframe src={src} title={item.title} className="h-full w-full" allowFullScreen />
                </figure>
              );
            })}
          </div>
        </section>
      ) : null}

      {files.length > 0 ? (
        <section className="mt-10">
          <h2 className="display mb-4 text-2xl text-white">Файлы</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((item) => (
              <a
                key={item.id}
                href={item.mediaId ? `/api/media/${item.mediaId}` : (item.externalUrl ?? "#")}
                target="_blank"
                rel="noreferrer"
                className="panel clip-corner flex items-center gap-4 p-4 transition hover:border-lime/60"
              >
                <span className="grid h-11 w-11 place-items-center border border-line bg-void/60 text-lg">📎</span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm text-white">{item.title}</span>
                  <span className="mono-label">скачать вложение</span>
                </span>
                <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-widest text-lime">↓</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="panel clip-corner mt-12 flex flex-wrap items-center gap-5 p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-neon to-cyan font-mono text-lg font-black text-void">
          {(post.authorName ?? "SF").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="mono-label">Автор материала</p>
          <p className="display text-xl text-white">{post.authorName ?? "Редакция SkinForge"}</p>
          <p className="mt-1 max-w-xl text-sm text-slate-400">{post.authorBio || "Колумнист SkinForge."}</p>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-12">
          <h2 className="display mb-4 text-2xl text-white">Читайте также</h2>
          <div className="grid gap-5">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
