import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  caseItems,
  cases,
  favorites,
  games,
  inventoryItems,
  orderItems,
  orders,
  postAttachments,
  posts,
  skins,
  users,
} from "@/db/schema";
import { ensureSeed } from "@/lib/seed";

export type SkinCardData = {
  id: number;
  title: string;
  weapon: string;
  rarity: string;
  exterior: string;
  price: number;
  imageUrl: string | null;
  imageMediaId: number | null;
  status: string;
  gameId: number | null;
  gameTitle: string | null;
  gameSlug: string | null;
  views: number;
  createdAt: Date;
  authorName: string | null;
};

const skinSelection = {
  id: skins.id,
  title: skins.title,
  weapon: skins.weapon,
  rarity: skins.rarity,
  exterior: skins.exterior,
  price: skins.price,
  imageUrl: skins.imageUrl,
  imageMediaId: skins.imageMediaId,
  status: skins.status,
  gameId: skins.gameId,
  gameTitle: games.title,
  gameSlug: games.slug,
  views: skins.views,
  createdAt: skins.createdAt,
  authorName: users.username,
};

export async function listGames() {
  await ensureSeed();
  return db.select().from(games).orderBy(asc(games.id));
}

export type SkinFilters = {
  q?: string;
  game?: string;
  rarity?: string;
  sort?: string;
  status?: string;
  limit?: number;
};

export async function listSkins(filters: SkinFilters = {}): Promise<SkinCardData[]> {
  await ensureSeed();
  const conditions = [eq(skins.status, filters.status ?? "approved")];
  if (filters.q) {
    const like = `%${filters.q}%`;
    conditions.push(
      or(ilike(skins.title, like), ilike(skins.weapon, like), ilike(skins.description, like))!,
    );
  }
  if (filters.game) conditions.push(eq(games.slug, filters.game));
  if (filters.rarity) conditions.push(eq(skins.rarity, filters.rarity));

  const orderBy =
    filters.sort === "price-asc"
      ? asc(skins.price)
      : filters.sort === "price-desc"
        ? desc(skins.price)
        : filters.sort === "popular"
          ? desc(skins.views)
          : desc(skins.createdAt);

  return db
    .select(skinSelection)
    .from(skins)
    .leftJoin(games, eq(games.id, skins.gameId))
    .leftJoin(users, eq(users.id, skins.authorId))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(filters.limit ?? 60);
}

export async function getSkin(id: number) {
  await ensureSeed();
  const rows = await db
    .select({ ...skinSelection, description: skins.description, floatValue: skins.floatValue, reviewNote: skins.reviewNote })
    .from(skins)
    .leftJoin(games, eq(games.id, skins.gameId))
    .leftJoin(users, eq(users.id, skins.authorId))
    .where(eq(skins.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type CaseCardData = {
  id: number;
  title: string;
  price: number;
  description: string;
  imageUrl: string | null;
  imageMediaId: number | null;
  status: string;
  gameTitle: string | null;
  gameSlug: string | null;
  itemCount: number;
  createdAt: Date;
  authorName: string | null;
};

export async function listCases(status = "approved"): Promise<CaseCardData[]> {
  await ensureSeed();
  return db
    .select({
      id: cases.id,
      title: cases.title,
      price: cases.price,
      description: cases.description,
      imageUrl: cases.imageUrl,
      imageMediaId: cases.imageMediaId,
      status: cases.status,
      gameTitle: games.title,
      gameSlug: games.slug,
      itemCount: sql<number>`(select count(*)::int from ${caseItems} where ${caseItems.caseId} = ${cases.id})`,
      createdAt: cases.createdAt,
      authorName: users.username,
    })
    .from(cases)
    .leftJoin(games, eq(games.id, cases.gameId))
    .leftJoin(users, eq(users.id, cases.authorId))
    .where(eq(cases.status, status))
    .orderBy(desc(cases.createdAt));
}

export async function getCase(id: number) {
  await ensureSeed();
  const rows = await db
    .select({
      id: cases.id,
      title: cases.title,
      price: cases.price,
      description: cases.description,
      imageUrl: cases.imageUrl,
      imageMediaId: cases.imageMediaId,
      status: cases.status,
      gameTitle: games.title,
      gameSlug: games.slug,
      createdAt: cases.createdAt,
      authorName: users.username,
    })
    .from(cases)
    .leftJoin(games, eq(games.id, cases.gameId))
    .leftJoin(users, eq(users.id, cases.authorId))
    .where(eq(cases.id, id))
    .limit(1);
  const found = rows[0];
  if (!found) return null;
  const contents = await db
    .select({
      skinId: skins.id,
      title: skins.title,
      weapon: skins.weapon,
      rarity: skins.rarity,
      price: skins.price,
      imageUrl: skins.imageUrl,
      imageMediaId: skins.imageMediaId,
      exterior: skins.exterior,
      weight: caseItems.weight,
    })
    .from(caseItems)
    .innerJoin(skins, eq(skins.id, caseItems.skinId))
    .where(eq(caseItems.caseId, id))
    .orderBy(asc(caseItems.weight));
  return { ...found, contents };
}

export type PostCardData = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverMediaId: number | null;
  tags: string;
  status: string;
  views: number;
  createdAt: Date;
  authorName: string | null;
  attachmentCount: number;
};

export async function listPosts(status = "approved", limit = 30): Promise<PostCardData[]> {
  await ensureSeed();
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      coverImageUrl: posts.coverImageUrl,
      coverMediaId: posts.coverMediaId,
      tags: posts.tags,
      status: posts.status,
      views: posts.views,
      createdAt: posts.createdAt,
      authorName: users.username,
      attachmentCount: sql<number>`(select count(*)::int from ${postAttachments} where ${postAttachments.postId} = ${posts.id})`,
      videoCount: sql<number>`(select count(*)::int from ${postAttachments} where ${postAttachments.postId} = ${posts.id} and ${postAttachments.kind} = 'video')`,
      imageCount: sql<number>`(select count(*)::int from ${postAttachments} where ${postAttachments.postId} = ${posts.id} and ${postAttachments.kind} = 'image')`,
      fileCount: sql<number>`(select count(*)::int from ${postAttachments} where ${postAttachments.postId} = ${posts.id} and ${postAttachments.kind} = 'file')`,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(eq(posts.status, status))
    .orderBy(desc(posts.createdAt))
    .limit(limit);
}

export async function getPostBySlug(slug: string) {
  await ensureSeed();
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      body: posts.body,
      coverImageUrl: posts.coverImageUrl,
      coverMediaId: posts.coverMediaId,
      videoUrl: posts.videoUrl,
      tags: posts.tags,
      status: posts.status,
      reviewNote: posts.reviewNote,
      views: posts.views,
      createdAt: posts.createdAt,
      authorName: users.username,
      authorBio: users.bio,
    })
    .from(posts)
    .leftJoin(users, eq(users.id, posts.authorId))
    .where(eq(posts.slug, slug))
    .limit(1);
  const found = rows[0];
  if (!found) return null;
  const attachments = await db
    .select()
    .from(postAttachments)
    .where(eq(postAttachments.postId, found.id))
    .orderBy(asc(postAttachments.id));
  return { ...found, attachments };
}

export async function getPostById(id: number) {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getDashboardData(userId: number) {
  const [inventory, myOrders, favs, spent] = await Promise.all([
    db
      .select({
        id: inventoryItems.id,
        skinId: skins.id,
        title: skins.title,
        rarity: skins.rarity,
        price: skins.price,
        imageUrl: skins.imageUrl,
        imageMediaId: skins.imageMediaId,
        exterior: skins.exterior,
        source: inventoryItems.source,
        pricePaid: inventoryItems.pricePaid,
        createdAt: inventoryItems.createdAt,
      })
      .from(inventoryItems)
      .innerJoin(skins, eq(skins.id, inventoryItems.skinId))
      .where(eq(inventoryItems.userId, userId))
      .orderBy(desc(inventoryItems.createdAt)),
    db
      .select({
        id: orders.id,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        items: sql<string>`(select string_agg(oi.title, ' · ') from ${orderItems} oi where oi.order_id = ${orders.id})`,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(25),
    db
      .select({
        id: favorites.id,
        skinId: skins.id,
        title: skins.title,
        rarity: skins.rarity,
        price: skins.price,
        imageUrl: skins.imageUrl,
        imageMediaId: skins.imageMediaId,
      })
      .from(favorites)
      .innerJoin(skins, eq(skins.id, favorites.skinId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt)),
    db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)::int` })
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.status, "paid"))),
  ]);
  const inventoryValue = inventory.reduce((acc, item) => acc + item.price, 0);
  return {
    inventory,
    orders: myOrders,
    favorites: favs,
    spentTotal: spent[0]?.total ?? 0,
    inventoryValue,
  };
}

export async function getStudioData(userId: number) {
  const [mySkins, myCases, myPosts] = await Promise.all([
    db
      .select(skinSelection)
      .from(skins)
      .leftJoin(games, eq(games.id, skins.gameId))
      .leftJoin(users, eq(users.id, skins.authorId))
      .where(eq(skins.authorId, userId))
      .orderBy(desc(skins.createdAt)),
    db
      .select({
        id: cases.id,
        title: cases.title,
        price: cases.price,
        description: cases.description,
        imageUrl: cases.imageUrl,
        imageMediaId: cases.imageMediaId,
        status: cases.status,
        gameTitle: games.title,
        itemCount: sql<number>`(select count(*)::int from ${caseItems} where ${caseItems.caseId} = ${cases.id})`,
        createdAt: cases.createdAt,
        authorName: users.username,
      })
      .from(cases)
      .leftJoin(games, eq(games.id, cases.gameId))
      .leftJoin(users, eq(users.id, cases.authorId))
      .where(eq(cases.authorId, userId))
      .orderBy(desc(cases.createdAt)),
    listPostsByAuthor(userId),
  ]);
  return { mySkins, myCases, myPosts };
}

export async function listPostsByAuthor(userId: number) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      reviewNote: posts.reviewNote,
      views: posts.views,
      createdAt: posts.createdAt,
      tags: posts.tags,
    })
    .from(posts)
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));
}

export async function getAdminData() {
  await ensureSeed();
  const [pendingSkins, pendingCases, pendingPosts, allUsers, stats] = await Promise.all([
    db
      .select({
        ...skinSelection,
        description: skins.description,
        reviewNote: skins.reviewNote,
        floatValue: skins.floatValue,
      })
      .from(skins)
      .leftJoin(games, eq(games.id, skins.gameId))
      .leftJoin(users, eq(users.id, skins.authorId))
      .where(inArray(skins.status, ["pending", "rejected"]))
      .orderBy(desc(skins.createdAt)),
    db
      .select({
        id: cases.id,
        title: cases.title,
        price: cases.price,
        description: cases.description,
        imageUrl: cases.imageUrl,
        status: cases.status,
        reviewNote: cases.reviewNote,
        createdAt: cases.createdAt,
        authorName: users.username,
        itemCount: sql<number>`(select count(*)::int from ${caseItems} where ${caseItems.caseId} = ${cases.id})`,
      })
      .from(cases)
      .leftJoin(users, eq(users.id, cases.authorId))
      .where(inArray(cases.status, ["pending", "rejected"]))
      .orderBy(desc(cases.createdAt)),
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        body: posts.body,
        status: posts.status,
        reviewNote: posts.reviewNote,
        createdAt: posts.createdAt,
        authorName: users.username,
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.authorId))
      .where(inArray(posts.status, ["pending", "rejected"]))
      .orderBy(desc(posts.createdAt)),
    db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        role: users.role,
        status: users.status,
        balance: users.balance,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.id)),
    db
      .select({
        skinsTotal: sql<number>`(select count(*)::int from ${skins} where status = 'approved')`,
        casesTotal: sql<number>`(select count(*)::int from ${cases} where status = 'approved')`,
        postsTotal: sql<number>`(select count(*)::int from ${posts} where status = 'approved')`,
        usersTotal: sql<number>`(select count(*)::int from ${users})`,
        ordersTotal: sql<number>`(select count(*)::int from ${orders})`,
        revenue: sql<number>`(select coalesce(sum(total), 0)::int from ${orders} where status = 'paid')`,
        pendingTotal: sql<number>`(select (select count(*)::int from ${skins} where status = 'pending') + (select count(*)::int from ${cases} where status = 'pending') + (select count(*)::int from ${posts} where status = 'pending'))`,
      })
      .from(sql`(select 1) as dummy`),
  ]);
  return {
    pendingSkins,
    pendingCases,
    pendingPosts,
    users: allUsers,
    stats: stats[0],
  };
}

export async function getSiteStats() {
  await ensureSeed();
  const rows = await db
    .select({
      skinsTotal: sql<number>`(select count(*)::int from ${skins} where status = 'approved')`,
      casesTotal: sql<number>`(select count(*)::int from ${cases} where status = 'approved')`,
      postsTotal: sql<number>`(select count(*)::int from ${posts} where status = 'approved')`,
      traders: sql<number>`(select count(*)::int from ${users})`,
    })
    .from(sql`(select 1) as dummy`);
  return rows[0];
}

export async function listApprovedSkinsForPicker() {
  return db
    .select({
      id: skins.id,
      title: skins.title,
      rarity: skins.rarity,
      price: skins.price,
    })
    .from(skins)
    .where(eq(skins.status, "approved"))
    .orderBy(asc(skins.title))
    .limit(200);
}
