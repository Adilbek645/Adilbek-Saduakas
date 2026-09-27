import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * SkinForge — marketplace + blog about in-game skins.
 * All money values are stored as integers in kopecks (1/100 ruble).
 */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    // user  — покупатель (личный кабинет покупателя)
    // author — автор контента (может отправлять материалы на модерацию)
    // admin — администратор (модерация, пользователи, публикации)
    role: text("role").notNull().default("user"),
    status: text("status").notNull().default("active"), // active | banned
    bio: text("bio").notNull().default(""),
    avatarUrl: text("avatar_url"),
    balance: integer("balance").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("users_role_idx").on(table.role)],
);

export const sessions = pgTable(
  "sessions",
  {
    token: text("token").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

/** Загруженные файлы (картинки / видео / прочее) хранятся в БД как base64. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id, {
    onDelete: "set null",
  }),
  kind: text("kind").notNull().default("file"), // image | video | file
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull().default(0),
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  accent: text("accent").notNull().default("#7c5cff"),
  emoji: text("emoji").notNull().default("🎮"),
});

export const skins = pgTable(
  "skins",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    weapon: text("weapon").notNull().default(""),
    gameId: integer("game_id").references(() => games.id, {
      onDelete: "set null",
    }),
    rarity: text("rarity").notNull().default("common"),
    exterior: text("exterior").notNull().default("Field-Tested"),
    floatValue: text("float_value").notNull().default(""),
    price: integer("price").notNull().default(0),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url"),
    imageMediaId: integer("image_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    reviewNote: text("review_note").notNull().default(""),
    authorId: integer("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewerId: integer("reviewer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [
    index("skins_status_idx").on(table.status),
    index("skins_game_idx").on(table.gameId),
  ],
);

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  gameId: integer("game_id").references(() => games.id, {
    onDelete: "set null",
  }),
  price: integer("price").notNull().default(0),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  imageMediaId: integer("image_media_id").references(() => media.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull().default("pending"),
  reviewNote: text("review_note").notNull().default(""),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const caseItems = pgTable(
  "case_items",
  {
    id: serial("id").primaryKey(),
    caseId: integer("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    skinId: integer("skin_id")
      .notNull()
      .references(() => skins.id, { onDelete: "cascade" }),
    weight: integer("weight").notNull().default(10),
  },
  (table) => [index("case_items_case_idx").on(table.caseId)],
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    coverImageUrl: text("cover_image_url"),
    coverMediaId: integer("cover_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    videoUrl: text("video_url").notNull().default(""),
    tags: text("tags").notNull().default(""),
    status: text("status").notNull().default("pending"),
    reviewNote: text("review_note").notNull().default(""),
    authorId: integer("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    views: integer("views").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  },
  (table) => [index("posts_status_idx").on(table.status)],
);

/** Вложения к посту: файлы, видео, картины. */
export const postAttachments = pgTable(
  "post_attachments",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").references(() => media.id, {
      onDelete: "cascade",
    }),
    externalUrl: text("external_url"),
    kind: text("kind").notNull().default("file"), // image | video | file
    title: text("title").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("post_attachments_post_idx").on(table.postId)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skinId: integer("skin_id")
      .notNull()
      .references(() => skins.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("favorites_user_idx").on(table.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    total: integer("total").notNull().default(0),
    status: text("status").notNull().default("paid"), // paid | refunded
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("orders_user_idx").on(table.userId)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("skin"), // skin | case
    refId: integer("ref_id"),
    title: text("title").notNull(),
    price: integer("price").notNull().default(0),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skinId: integer("skin_id")
      .notNull()
      .references(() => skins.id, { onDelete: "cascade" }),
    source: text("source").notNull().default("purchase"), // purchase | case | sale
    sourceCaseId: integer("source_case_id"),
    pricePaid: integer("price_paid").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("inventory_user_idx").on(table.userId)],
);

export type UserRow = typeof users.$inferSelect;
export type SkinRow = typeof skins.$inferSelect;
export type CaseRow = typeof cases.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
