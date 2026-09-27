import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  caseItems,
  cases,
  favorites,
  games,
  inventoryItems,
  media,
  orderItems,
  orders,
  postAttachments,
  posts,
  skins,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/ui";

let seedChecked = false;
let seedAttempted = false;

const GAMES = [
  { slug: "cs2", title: "Counter-Strike 2", accent: "#ff9f1c", emoji: "🔫" },
  { slug: "dota2", title: "Dota 2", accent: "#d02b2b", emoji: "🗡️" },
  { slug: "valorant", title: "Valorant", accent: "#ff4655", emoji: "🎯" },
  { slug: "fortnite", title: "Fortnite", accent: "#7c5cff", emoji: "🛡️" },
];

export async function ensureSeed() {
  if (seedChecked || seedAttempted) return;
  seedAttempted = true;
  try {
    const existing = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    if ((existing[0]?.count ?? 0) > 0) { seedChecked = true; return; }

    // Idempotent: insert games only if not present
    let gameRows = await db.select().from(games);
    if (gameRows.length === 0) {
      gameRows = await db.insert(games).values(GAMES).returning();
    }
    const gameBySlug = new Map(gameRows.map((g) => [g.slug, g.id]));

    let userRows = await db.select().from(users).limit(5);
    if (userRows.length === 0) {
    userRows = await db
      .insert(users)
      .values([
        {
          email: "admin@skinvault.gg",
          username: "OVERSEER",
          passwordHash: hashPassword("admin123"),
          role: "admin",
          bio: "Главный модератор SkinForge. Проверяю скины, кейсы и статьи.",
          balance: 10_000_000,
        },
        {
          email: "author@skinvault.gg",
          username: "NEONWRITER",
          passwordHash: hashPassword("author123"),
          role: "author",
          bio: "Пишу про редкие скины и рынок CS2 с 2017 года.",
          balance: 150_000,
        },
        {
          email: "buyer@skinvault.gg",
          username: "SKINHUNTER",
          passwordHash: hashPassword("buyer123"),
          role: "user",
          bio: "Коллекционирую ножи и гловые финиши.",
          balance: 780_000,
        },
      ])
      .returning();
    }

    const admin = userRows[0];
    const author = userRows[1];
    const buyer = userRows[2];

    const skinSeed = [
      ["AK-47 | Neon Circuit", "AK-47", "cs2", "legendary", "Factory New", "0.021", 489_900, "/img/skin-ak.png", "Лимитированная серия с неоновой схемой плати. Паттерн светится при попадании в свет."],
      ["AWP | Jade Serpent", "AWP", "cs2", "mythical", "Minimal Wear", "0.072", 1_250_000, "/img/skin-awp.png", "Ручная роспись дракона по белому лаку. Один из самых узнаваемых финишей в истории игры."],
      ["Karambit | Chromatic Decay", "Нож", "cs2", "exotic", "Factory New", "0.008", 3_990_000, "/img/skin-knife.png", "Радужное анодирование клинка. Переливается при повороте — идеальный вариант для инвентаря стримера."],
      ["Desert Eagle | Ruby Glass", "Desert Eagle", "cs2", "epic", "Field-Tested", "0.183", 215_000, "/img/skin-pistol.png", "Полупрозрачные панели из рубинового стекла и золотая гравировка."],
      ["MP9 | Hologrid", "MP9", "cs2", "rare", "Factory New", "0.034", 74_500, "/img/skin-smg.png", "Киберпанк-геометрия с голографическими вставками. Отличный бюджетный вариант."],
      ["M4A1-S | Nightfall", "M4A1-S", "cs2", "rare", "Well-Worn", "0.381", 96_000, "/img/skin-smg.png", "Матовый финиш для любителей стелса."],
      ["Butterfly | Void Edge", "Нож", "cs2", "exotic", "Factory New", "0.015", 2_450_000, "/img/skin-knife.png", "Тёмная сталь с фиолетовой кромкой и анимацией раскрытия."],
      ["Blade of the Viper", "Оружие героя", "dota2", "legendary", "Arcana", "", 640_000, "/img/skin-awp.png", "Arcana-предмет с кастомным эффектом и счётчиком добиваний."],
      ["Vandal | Ion Rush", "Vandal", "valorant", "epic", "Factory New", "", 158_000, "/img/skin-pistol.png", "Плазменные линии и синие искры при перезарядке."],
      ["Aegis Breaker Pack", "Набор", "fortnite", "uncommon", "", "", 42_000, "/img/skin-ak.png", "Комплект косметики сезона с уникальной эмоцией."],
      ["Glock-18 | Sugar Rush", "Glock-18", "cs2", "uncommon", "Field-Tested", "0.244", 28_900, "/img/skin-smg.png", "Сладкая палитра для быстрых раундов на пистолетках."],
      ["USP-S | Paper Cut", "USP-S", "cs2", "common", "Battle-Scarred", "0.712", 9_900, "/img/skin-pistol.png", "Классический бумажный принт, потёртый до металла."],
    ] as const;

    const skinRows = await db
      .insert(skins)
      .values(
        skinSeed.map(([title, weapon, gameSlug, rar, exterior, float, price, image, description], i) => ({
          title,
          weapon,
          gameId: gameBySlug.get(gameSlug) ?? null,
          rarity: rar,
          exterior,
          floatValue: float,
          price,
          description,
          imageUrl: image,
          status: i < 10 ? "approved" : i === 10 ? "pending" : "approved",
          authorId: i < 10 ? admin.id : author.id,
          reviewerId: i < 10 ? admin.id : null,
          reviewedAt: i < 10 ? new Date() : null,
          views: 120 + i * 37,
        })),
      )
      .returning();

    const approved = skinRows.filter((s) => s.status === "approved");

    const caseRows = await db
      .insert(cases)
      .values([
        {
          title: "Neon Circuit Case",
          gameId: gameBySlug.get("cs2") ?? null,
          price: 349_00,
          description: "Кейс с неоновыми финишами. Шанс на тайный нож — 1.2%.",
          imageUrl: "/img/case-neon.png",
          status: "approved",
          authorId: admin.id,
        },
        {
          title: "Dragon Vault",
          gameId: gameBySlug.get("cs2") ?? null,
          price: 899_00,
          description: "Премиальный кейс для охотников за драконьими паттернами.",
          imageUrl: "/img/case-neon.png",
          status: "approved",
          authorId: admin.id,
        },
        {
          title: "Rift Arsenal",
          gameId: gameBySlug.get("valorant") ?? null,
          price: 199_00,
          description: "Кросс-игровой кейс: Valorant, Dota 2 и Fortnite.",
          imageUrl: "/img/case-neon.png",
          status: "pending",
          reviewNote: "",
          authorId: author.id,
        },
      ])
      .returning();

    await db.insert(caseItems).values([
      { caseId: caseRows[0].id, skinId: approved[0].id, weight: 22 },
      { caseId: caseRows[0].id, skinId: approved[4].id, weight: 40 },
      { caseId: caseRows[0].id, skinId: approved[3].id, weight: 25 },
      { caseId: caseRows[0].id, skinId: approved[1].id, weight: 10 },
      { caseId: caseRows[0].id, skinId: approved[2].id, weight: 3 },
      { caseId: caseRows[1].id, skinId: approved[1].id, weight: 35 },
      { caseId: caseRows[1].id, skinId: approved[6].id, weight: 12 },
      { caseId: caseRows[1].id, skinId: approved[5].id, weight: 33 },
      { caseId: caseRows[1].id, skinId: approved[9].id, weight: 20 },
    ]);

    const postSeed = [
      {
        title: "Как формируется цена на редкие скины в 2026 году",
        slug: slugify("Как формируется цена на редкие скины в 2026 году"),
        excerpt: "Разбираем, почему паттерн и float важнее редкости, и как читать графики рынка.",
        body:
          "Рынок скинов давно перестал быть хаотичным.\n\nТри фактора определяют цену: тираж, float и паттерн. Тираж задаёт нижнюю границу, float — средний коридор, а паттерн способен умножить стоимость в 10 раз.\n\nМы собрали статистику по 12 000 сделок за квартал и вывели простое правило: если паттерн центрирован и не обрезан краями модели — просите премию минимум 35%.",
        cover: "/img/blog-1.jpg",
        video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        tags: "рынок, аналитика, гайд",
        status: "approved",
        authorId: author.id,
      },
      {
        title: "Топ-5 кейсов, которые всё ещё выгодно открывать",
        slug: slugify("Топ-5 кейсов, которые всё ещё выгодно открывать"),
        excerpt: "Математика кейсов: считаем ожидаемую ценность и сравниваем с прямой покупкой.",
        body:
          "Кейсы — это лотерея с прозрачными шансами.\n\nМы посчитали EV для каждого кейса в каталоге и выяснили: только три из них дают положительное ожидание при текущих ценах на скины.\n\nВажно помнить про комиссию при выводе — она съедает до 12% прибыли.",
        cover: "/img/blog-2.jpg",
        video: "",
        tags: "кейсы, математика",
        status: "approved",
        authorId: author.id,
      },
      {
        title: "Neon Circuit: как появился самый обсуждаемый финиш сезона",
        slug: slugify("Neon Circuit: как появился самый обсуждаемый финиш сезона"),
        excerpt: "Интервью с художником и полный разбор референсов.",
        body:
          "Мы поговорили с автором финиша о том, как выбирали палитру и почему схема печатается в два прохода.\n\nВ галерее ниже — концепт-арты и короткое видео с вращением модели в игровом движке.",
        cover: "/img/blog-3.jpg",
        video: "",
        tags: "интервью, арт",
        status: "approved",
        authorId: author.id,
      },
      {
        title: "Черновик: подборка дешёвых ножей до 5 000 ₽",
        slug: slugify("Черновик: подборка дешёвых ножей до 5 000 ₽"),
        excerpt: "Материал ещё на модерации у администратора.",
        body: "Собрал пять вариантов, жду проверки модератора перед публикацией.",
        cover: "/img/blog-2.jpg",
        video: "",
        tags: "подборка",
        status: "pending",
        authorId: buyer.id,
      },
    ];

    const postRows = await db.insert(posts).values(
      postSeed.map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        body: p.body,
        coverImageUrl: p.cover,
        videoUrl: p.video,
        tags: p.tags,
        status: p.status,
        authorId: p.authorId,
        views: 320,
      })),
    ).returning();

    // Демо-вложение: картинка-галерея в первую статью (внешние ссылки).
    await db.insert(postAttachments).values([
      { postId: postRows[0].id, kind: "image", externalUrl: "/img/blog-1.jpg", title: "График динамики цен" },
      { postId: postRows[0].id, kind: "image", externalUrl: "/img/blog-3.jpg", title: "Тепловая карта паттернов" },
      { postId: postRows[2].id, kind: "image", externalUrl: "/img/blog-2.jpg", title: "Референс палитры" },
      { postId: postRows[2].id, kind: "file", externalUrl: "/img/blog-1.jpg", title: "Концепт-арт (презентация)" },
    ]);

    await db.insert(favorites).values([
      { userId: buyer.id, skinId: approved[2].id },
      { userId: buyer.id, skinId: approved[1].id },
    ]);

    const orderRows = await db
      .insert(orders)
      .values([
        { userId: buyer.id, total: approved[4].price, status: "paid" },
        { userId: buyer.id, total: approved[3].price + caseRows[0].price, status: "paid" },
      ])
      .returning();

    await db.insert(orderItems).values([
      { orderId: orderRows[0].id, kind: "skin", refId: approved[4].id, title: approved[4].title, price: approved[4].price },
      { orderId: orderRows[1].id, kind: "skin", refId: approved[3].id, title: approved[3].title, price: approved[3].price },
      { orderId: orderRows[1].id, kind: "case", refId: caseRows[0].id, title: caseRows[0].title, price: caseRows[0].price },
    ]);

    await db.insert(inventoryItems).values([
      { userId: buyer.id, skinId: approved[4].id, source: "purchase", pricePaid: approved[4].price },
      { userId: buyer.id, skinId: approved[3].id, source: "purchase", pricePaid: approved[3].price },
      { userId: buyer.id, skinId: approved[5].id, source: "case", sourceCaseId: caseRows[0].id, pricePaid: 0 },
    ]);

    // Пустая запись media не нужна — файлы загружаются пользователями через студию.
    await db.select({ id: media.id }).from(media).limit(1);
  } catch (error) {
    console.error("seed failed", error);
    // Do NOT reset seedAttempted — prevents infinite retry loops on every request.
    seedChecked = true;
  }
}
