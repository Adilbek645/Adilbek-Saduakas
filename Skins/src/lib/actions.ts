"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, sql } from "drizzle-orm";
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
  sessions,
  skins,
  users,
} from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { ensureSeed } from "@/lib/seed";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, parseMoneyToKopecks, slugify } from "@/lib/ui";
import type { ActionResult, OpenCaseResult } from "@/lib/types";

const SELL_BACK_RATE = 0.7;

function str(data: FormData, key: string, fallback = "") {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function num(data: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(str(data, key, ""), 10);
  return Number.isFinite(value) ? value : fallback;
}

async function saveUpload(file: File, ownerId: number) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Файл больше 6 МБ");
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.includes(mime)) throw new Error(`Тип файла не поддерживается: ${mime}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = mime.startsWith("video/") ? "video" : mime.startsWith("image/") ? "image" : "file";
  const rows = await db
    .insert(media)
    .values({
      ownerId,
      kind,
      fileName: file.name || "upload",
      mimeType: mime,
      byteSize: buffer.byteLength,
      data: buffer.toString("base64"),
    })
    .returning({ id: media.id });
  return { id: rows[0].id, kind };
}

/* ------------------------------------------------------------------ AUTH */

export async function registerAction(formData: FormData) {
  await ensureSeed();
  const email = str(formData, "email").toLowerCase();
  const username = str(formData, "username");
  const password = str(formData, "password");
  const back = (msg: string) => redirect(`/register?error=${encodeURIComponent(msg)}`);

  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return back("Введите корректный e-mail");
  if (username.length < 3) return back("Никнейм должен быть от 3 символов");
  if (password.length < 6) return back("Пароль должен быть от 6 символов");

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email} or lower(${users.username}) = ${username.toLowerCase()}`)
    .limit(1);
  if (existing.length > 0) return back("Такой e-mail или никнейм уже заняты");

  const rows = await db
    .insert(users)
    .values({
      email,
      username,
      passwordHash: hashPassword(password),
      role: "user",
      balance: 50_000,
    })
    .returning({ id: users.id });

  await createSession(rows[0].id);
  revalidatePath("/", "layout");
  redirect("/dashboard?welcome=1");
}

export async function loginAction(formData: FormData) {
  await ensureSeed();
  const identity = str(formData, "identity").toLowerCase();
  const password = str(formData, "password");
  const back = (msg: string) => redirect(`/login?error=${encodeURIComponent(msg)}`);

  if (!identity || !password) return back("Заполните все поля");

  const rows = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${identity} or lower(${users.username}) = ${identity}`)
    .limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) return back("Неверный логин или пароль");
  if (user.status === "banned") return back("Аккаунт заблокирован администратором");

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect(user.role === "admin" ? "/admin" : user.role === "author" ? "/studio" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const username = str(formData, "username", user.username);
  const bio = str(formData, "bio").slice(0, 500);
  if (username.length < 3) {
    redirect("/dashboard?tab=profile&error=" + encodeURIComponent("Никнейм слишком короткий"));
  }
  const avatarFile = formData.get("avatar");
  let avatarUrl = user.avatarUrl;
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const saved = await saveUpload(avatarFile, user.id);
    if (saved) avatarUrl = `/api/media/${saved.id}`;
  }
  await db.update(users).set({ username, bio, avatarUrl }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  redirect("/dashboard?tab=profile&saved=1");
}

/* -------------------------------------------------------------- PURCHASES */

export async function buySkinAction(formData: FormData) {
  const user = await getCurrentUser();
  const skinId = num(formData, "skinId");
  if (!user) redirect(`/login?next=/skins/${skinId}`);

  const rows = await db.select().from(skins).where(eq(skins.id, skinId)).limit(1);
  const skin = rows[0];
  if (!skin || skin.status !== "approved") {
    redirect(`/skins/${skinId}?error=${encodeURIComponent("Скин недоступен")}`);
  }
  if (user.balance < skin.price) {
    redirect(`/skins/${skinId}?error=${encodeURIComponent("Недостаточно средств — пополните баланс")}`);
  }

  const orderRows = await db
    .insert(orders)
    .values({ userId: user.id, total: skin.price, status: "paid" })
    .returning({ id: orders.id });
  await db.insert(orderItems).values({
    orderId: orderRows[0].id,
    kind: "skin",
    refId: skin.id,
    title: skin.title,
    price: skin.price,
  });
  await db
    .update(users)
    .set({ balance: sql`${users.balance} - ${skin.price}` })
    .where(eq(users.id, user.id));
  await db.insert(inventoryItems).values({
    userId: user.id,
    skinId: skin.id,
    source: "purchase",
    pricePaid: skin.price,
  });

  revalidatePath("/dashboard");
  revalidatePath("/skins");
  redirect(`/dashboard?bought=${encodeURIComponent(skin.title)}`);
}

export async function depositAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const amount = Math.min(Math.max(parseMoneyToKopecks(str(formData, "amount")), 0), 5_000_000);
  if (amount <= 0) redirect("/dashboard?error=" + encodeURIComponent("Некорректная сумма"));
  await db
    .update(users)
    .set({ balance: sql`${users.balance} + ${amount}` })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard");
  redirect("/dashboard?saved=1");
}

export async function sellItemAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const itemId = num(formData, "itemId");
  const rows = await db
    .select({ id: inventoryItems.id, skinId: inventoryItems.skinId, price: skins.price })
    .from(inventoryItems)
    .innerJoin(skins, eq(skins.id, inventoryItems.skinId))
    .where(and(eq(inventoryItems.id, itemId), eq(inventoryItems.userId, user.id)))
    .limit(1);
  const item = rows[0];
  if (item) {
    const payout = Math.round(item.price * SELL_BACK_RATE);
    await db.delete(inventoryItems).where(eq(inventoryItems.id, item.id));
    await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${payout}` })
      .where(eq(users.id, user.id));
  }
  revalidatePath("/dashboard");
  redirect("/dashboard?saved=1");
}

export async function toggleFavoriteAction(formData: FormData) {
  const user = await getCurrentUser();
  const skinId = num(formData, "skinId");
  if (!user) redirect(`/login?next=/skins/${skinId}`);
  const rows = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.skinId, skinId)))
    .limit(1);
  if (rows[0]) {
    await db.delete(favorites).where(eq(favorites.id, rows[0].id));
  } else {
    await db.insert(favorites).values({ userId: user.id, skinId });
  }
  revalidatePath(`/skins/${skinId}`);
  revalidatePath("/dashboard");
  redirect(`/skins/${skinId}`);
}

export async function openCaseAction(caseId: number): Promise<OpenCaseResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Войдите в личный кабинет, чтобы открывать кейсы" };

  const caseRows = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
  const lootBox = caseRows[0];
  if (!lootBox || lootBox.status !== "approved") return { ok: false, message: "Кейс недоступен" };
  if (user.balance < lootBox.price) {
    return { ok: false, message: "Недостаточно средств на балансе" };
  }

  const contents = await db
    .select({
      skinId: skins.id,
      title: skins.title,
      rarity: skins.rarity,
      exterior: skins.exterior,
      price: skins.price,
      imageUrl: skins.imageUrl,
      imageMediaId: skins.imageMediaId,
      weight: caseItems.weight,
    })
    .from(caseItems)
    .innerJoin(skins, eq(skins.id, caseItems.skinId))
    .where(eq(caseItems.caseId, caseId));

  if (contents.length === 0) return { ok: false, message: "Кейс пуст — дождитесь наполнения" };

  const totalWeight = contents.reduce((acc, item) => acc + item.weight, 0);
  let roll = Math.random() * totalWeight;
  let drop = contents[0];
  for (const item of contents) {
    roll -= item.weight;
    if (roll <= 0) {
      drop = item;
      break;
    }
  }

  await db
    .update(users)
    .set({ balance: sql`${users.balance} - ${lootBox.price}` })
    .where(eq(users.id, user.id));
  const orderRows = await db
    .insert(orders)
    .values({ userId: user.id, total: lootBox.price, status: "paid" })
    .returning({ id: orders.id });
  await db.insert(orderItems).values({
    orderId: orderRows[0].id,
    kind: "case",
    refId: lootBox.id,
    title: `${lootBox.title} → ${drop.title}`,
    price: lootBox.price,
  });
  await db.insert(inventoryItems).values({
    userId: user.id,
    skinId: drop.skinId,
    source: "case",
    sourceCaseId: lootBox.id,
    pricePaid: lootBox.price,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/cases/${caseId}`);

  return {
    ok: true,
    message: "Кейс открыт!",
    drop: {
      skinId: drop.skinId,
      title: drop.title,
      rarity: drop.rarity,
      exterior: drop.exterior,
      price: drop.price,
      image: drop.imageMediaId ? `/api/media/${drop.imageMediaId}` : drop.imageUrl,
      chance: Math.round((drop.weight / totalWeight) * 1000) / 10,
    },
  };
}

/* -------------------------------------------------------- AUTHOR STUDIO */

export async function submitSkinAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");
  const title = str(formData, "title");
  if (title.length < 3) redirect("/studio?error=" + encodeURIComponent("Укажите название скина"));

  const gameSlug = str(formData, "game");
  const gameRows = gameSlug
    ? await db.select({ id: games.id }).from(games).where(eq(games.slug, gameSlug)).limit(1)
    : [];

  let imageMediaId: number | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveUpload(file, user.id);
      imageMediaId = saved?.id ?? null;
    } catch (error) {
      redirect(`/studio?error=${encodeURIComponent(error instanceof Error ? error.message : "Ошибка загрузки")}`);
    }
  }

  await db.insert(skins).values({
    title,
    weapon: str(formData, "weapon"),
    gameId: gameRows[0]?.id ?? null,
    rarity: str(formData, "rarity", "common"),
    exterior: str(formData, "exterior", "Field-Tested"),
    floatValue: str(formData, "floatValue"),
    price: parseMoneyToKopecks(str(formData, "price")),
    description: str(formData, "description").slice(0, 4000),
    imageUrl: imageMediaId ? null : str(formData, "imageUrl") || null,
    imageMediaId,
    status: "pending",
    authorId: user.id,
  });

  revalidatePath("/studio");
  revalidatePath("/admin");
  redirect("/studio?saved=skin");
}

export async function submitCaseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");
  const title = str(formData, "title");
  if (title.length < 3) redirect("/studio?error=" + encodeURIComponent("Укажите название кейса"));

  const gameSlug = str(formData, "game");
  const gameRows = gameSlug
    ? await db.select({ id: games.id }).from(games).where(eq(games.slug, gameSlug)).limit(1)
    : [];

  let imageMediaId: number | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveUpload(file, user.id);
      imageMediaId = saved?.id ?? null;
    } catch (error) {
      redirect(`/studio?error=${encodeURIComponent(error instanceof Error ? error.message : "Ошибка загрузки")}`);
    }
  }

  const caseRows = await db
    .insert(cases)
    .values({
      title,
      gameId: gameRows[0]?.id ?? null,
      price: parseMoneyToKopecks(str(formData, "price")),
      description: str(formData, "description").slice(0, 2000),
      imageUrl: imageMediaId ? null : str(formData, "imageUrl") || "/img/case-neon.png",
      imageMediaId,
      status: "pending",
      authorId: user.id,
    })
    .returning({ id: cases.id });

  const skinIds = formData
    .getAll("skinIds")
    .map((value) => Number.parseInt(String(value), 10))
    .filter((value) => Number.isFinite(value));
  if (skinIds.length > 0) {
    const picked = await db
      .select({ id: skins.id })
      .from(skins)
      .where(sql`${skins.id} in ${skinIds}`);
    if (picked.length > 0) {
      await db.insert(caseItems).values(
        picked.map((skin) => ({ caseId: caseRows[0].id, skinId: skin.id, weight: 10 })),
      );
    }
  }

  revalidatePath("/studio");
  revalidatePath("/admin");
  redirect("/studio?saved=case");
}

export async function submitPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (title.length < 5 || body.length < 20) {
    redirect("/studio?error=" + encodeURIComponent("Заголовок от 5 символов, текст от 20"));
  }

  let coverMediaId: number | null = null;
  const cover = formData.get("cover");
  if (cover instanceof File && cover.size > 0) {
    try {
      const saved = await saveUpload(cover, user.id);
      coverMediaId = saved?.id ?? null;
    } catch (error) {
      redirect(`/studio?error=${encodeURIComponent(error instanceof Error ? error.message : "Ошибка загрузки")}`);
    }
  }

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;
  const postRows = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt: str(formData, "excerpt").slice(0, 300) || body.slice(0, 160),
      body: body.slice(0, 20000),
      coverImageUrl: coverMediaId ? null : str(formData, "coverUrl") || null,
      coverMediaId,
      videoUrl: str(formData, "videoUrl"),
      tags: str(formData, "tags"),
      status: "pending",
      authorId: user.id,
    })
    .returning({ id: posts.id });

  // Вложения: несколько файлов + внешние ссылки (видео/картины).
  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    try {
      const saved = await saveUpload(file, user.id);
      if (saved) {
        await db.insert(postAttachments).values({
          postId: postRows[0].id,
          mediaId: saved.id,
          kind: saved.kind,
          title: file.name,
        });
      }
    } catch {
      // пропускаем неподдерживаемый файл, остальное сохраняем
    }
  }
  const externalUrl = str(formData, "externalUrl");
  const externalKind = str(formData, "externalKind", "image");
  if (externalUrl) {
    await db.insert(postAttachments).values({
      postId: postRows[0].id,
      externalUrl,
      kind: externalKind,
      title: str(formData, "externalTitle") || "Вложение",
    });
  }

  revalidatePath("/studio");
  revalidatePath("/admin");
  redirect("/studio?saved=post");
}

/* ------------------------------------------------------------ MODERATION */

export async function moderateSkinAction(formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") redirect("/login?error=" + encodeURIComponent("Нужны права администратора"));
  const id = num(formData, "id");
  const decision = str(formData, "decision", "approved");
  await db
    .update(skins)
    .set({
      status: decision,
      reviewNote: str(formData, "note"),
      reviewerId: admin.id,
      reviewedAt: new Date(),
    })
    .where(eq(skins.id, id));
  revalidatePath("/admin");
  revalidatePath("/skins");
  redirect("/admin?tab=skins&saved=1");
}

export async function moderateCaseAction(formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") redirect("/login?error=" + encodeURIComponent("Нужны права администратора"));
  const id = num(formData, "id");
  const decision = str(formData, "decision", "approved");
  await db
    .update(cases)
    .set({ status: decision, reviewNote: str(formData, "note") })
    .where(eq(cases.id, id));
  revalidatePath("/admin");
  revalidatePath("/cases");
  redirect("/admin?tab=cases&saved=1");
}

export async function moderatePostAction(formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") redirect("/login?error=" + encodeURIComponent("Нужны права администратора"));
  const id = num(formData, "id");
  const decision = str(formData, "decision", "approved");
  await db
    .update(posts)
    .set({ status: decision, reviewNote: str(formData, "note"), reviewedAt: new Date() })
    .where(eq(posts.id, id));
  revalidatePath("/admin");
  revalidatePath("/blog");
  redirect(`/admin?tab=posts&saved=1`);
}

export async function updateCaseContentsAction(formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") redirect("/login?error=" + encodeURIComponent("Нужны права администратора"));
  const caseId = num(formData, "caseId");
  const skinIds = formData
    .getAll("skinIds")
    .map((value) => Number.parseInt(String(value), 10))
    .filter((value) => Number.isFinite(value));
  await db.delete(caseItems).where(eq(caseItems.caseId, caseId));
  if (skinIds.length > 0) {
    await db.insert(caseItems).values(
      skinIds.map((skinId) => ({ caseId, skinId, weight: 10 })),
    );
  }
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/admin");
  redirect(`/admin?tab=cases&saved=1`);
}

export async function updateUserAction(formData: FormData) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") redirect("/login?error=" + encodeURIComponent("Нужны права администратора"));
  const id = num(formData, "id");
  if (id === admin.id) {
    redirect("/admin?tab=users&error=" + encodeURIComponent("Нельзя изменять свой аккаунт"));
  }
  const role = str(formData, "role", "user");
  const status = str(formData, "status", "active");
  const delta = parseMoneyToKopecks(str(formData, "balanceDelta"));
  await db
    .update(users)
    .set({
      role: ["user", "author", "admin"].includes(role) ? role : "user",
      status: status === "banned" ? "banned" : "active",
    })
    .where(eq(users.id, id));
  if (delta !== 0) {
    await db
      .update(users)
      .set({ balance: sql`greatest(${users.balance} + ${delta}, 0)` })
      .where(eq(users.id, id));
  }
  if (status === "banned") {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }
  revalidatePath("/admin");
  redirect("/admin?tab=users&saved=1");
}

export async function deleteSubmissionAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = num(formData, "id");
  const kind = str(formData, "kind");
  if (kind === "skin") {
    await db.delete(skins).where(and(eq(skins.id, id), eq(skins.authorId, user.id)));
  } else if (kind === "post") {
    await db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, user.id)));
  } else if (kind === "case") {
    await db.delete(cases).where(and(eq(cases.id, id), eq(cases.authorId, user.id)));
  }
  revalidatePath("/studio");
}

export async function quickNavAction(): Promise<ActionResult> {
  const user = await getCurrentUser();
  return { ok: Boolean(user), message: user ? user.role : "guest" };
}
