import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate, money, rarity, statusInfo } from "@/lib/ui";

export function SkinCard({
  skin,
  footer,
}: {
  skin: {
    id: number;
    title: string;
    weapon: string;
    rarity: string;
    exterior: string;
    price: number;
    imageUrl: string | null;
    imageMediaId: number | null;
    status?: string;
    gameTitle?: string | null;
  };
  footer?: ReactNode;
}) {
  const r = rarity(skin.rarity);
  const href = `/api/media/${skin.imageMediaId}`;
  const image = skin.imageMediaId ? href : skin.imageUrl;

  return (
    <article
      className="panel clip-corner skin-card group flex flex-col"
      style={{ ["--rarity" as string]: r.color }}
    >
      <Link href={`/skins/${skin.id}`} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-gradient-to-br from-panel-2 to-void">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={skin.title}
              className="shine h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center font-mono text-xs text-slate-600">
              NO PREVIEW
            </div>
          )}
          <span
            className="absolute left-0 top-3 px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-void"
            style={{ background: r.color }}
          >
            {r.label}
          </span>
          {skin.status && skin.status !== "approved" ? (
            <span
              className="absolute right-2 top-3 border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest"
              style={{ color: statusInfo(skin.status).color, borderColor: statusInfo(skin.status).color }}
            >
              {statusInfo(skin.status).label}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="mono-label">{skin.weapon || "—"}</span>
          {skin.gameTitle ? (
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-cyan">
              {skin.gameTitle}
            </span>
          ) : null}
        </div>
        <Link href={`/skins/${skin.id}`} className="display text-lg leading-tight text-white hover:text-cyan">
          {skin.title}
        </Link>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">{skin.exterior}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-base font-bold text-lime">{money(skin.price)}</span>
          {footer ?? (
            <Link href={`/skins/${skin.id}`} className="btn btn-ghost !px-3 !py-1.5 !text-[0.6rem]">
              Подробнее
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function CaseCard({
  box,
}: {
  box: {
    id: number;
    title: string;
    price: number;
    itemCount: number;
    imageUrl: string | null;
    imageMediaId: number | null;
    gameTitle?: string | null;
    description: string;
  };
}) {
  const image = box.imageMediaId ? `/api/media/${box.imageMediaId}` : box.imageUrl;
  return (
    <Link href={`/cases/${box.id}`} className="panel clip-corner skin-card group block">
      <div className="relative aspect-video overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={box.title}
            className="shine h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="mono-label">{box.gameTitle ?? "Кейс"}</p>
          <h3 className="display text-xl text-white">{box.title}</h3>
        </div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="mono-label">Содержимое</p>
          <p className="font-mono text-sm text-white">{box.itemCount} предметов</p>
        </div>
        <span className="btn btn-primary !py-2">{money(box.price)}</span>
      </div>
    </Link>
  );
}

export function PostCard({
  post,
}: {
  post: {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    coverImageUrl: string | null;
    coverMediaId: number | null;
    tags: string;
    createdAt: Date;
    authorName: string | null;
    attachmentCount?: number;
    videoCount?: number;
    imageCount?: number;
    fileCount?: number;
    status?: string;
  };
}) {
  const image = post.coverMediaId ? `/api/media/${post.coverMediaId}` : post.coverImageUrl;
  const tags = post.tags.split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <article className="panel clip-corner group grid gap-0 md:grid-cols-[220px_1fr]">
      <div className="relative min-h-40 overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neon/30 to-cyan/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-panel/90 md:to-panel" />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <span key={tag} className="border border-line px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-cyan">
              #{tag}
            </span>
          ))}
          {post.status && post.status !== "approved" ? (
            <span className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: statusInfo(post.status).color }}>
              ● {statusInfo(post.status).label}
            </span>
          ) : null}
        </div>
        <Link href={`/blog/${post.slug}`} className="display text-2xl leading-tight text-white hover:text-cyan">
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 font-mono text-[0.62rem] uppercase tracking-widest text-slate-500">
          <span>✍ {post.authorName ?? "неизвестен"}</span>
          <span>◷ {formatDate(post.createdAt)}</span>
          {typeof post.imageCount === "number" && post.imageCount > 0 ? (
            <span className="text-cyan">🖼 {post.imageCount} картин</span>
          ) : null}
          {typeof post.videoCount === "number" && post.videoCount > 0 ? (
            <span className="text-ember">🎬 {post.videoCount} видео</span>
          ) : null}
          {typeof post.fileCount === "number" && post.fileCount > 0 ? (
            <span className="text-lime">📎 {post.fileCount} файлов</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function SectionTitle({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mono-label">{kicker}</p>
        <h2 className="display text-3xl text-white sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "ok" | "warn" | "error" | "info"; children: ReactNode }) {
  const map = {
    ok: "border-lime/50 bg-lime/10 text-lime",
    warn: "border-[#f5c451]/50 bg-[#f5c451]/10 text-[#f5c451]",
    error: "border-[#ff5f6d]/50 bg-[#ff5f6d]/10 text-[#ff98a2]",
    info: "border-cyan/50 bg-cyan/10 text-cyan",
  } as const;
  return (
    <div className={`clip-corner-sm border px-4 py-3 font-mono text-xs uppercase tracking-widest ${map[tone]}`}>
      {children}
    </div>
  );
}
