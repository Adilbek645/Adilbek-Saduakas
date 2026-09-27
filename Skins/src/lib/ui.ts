/** Pure helpers — safe to import both in server and client components. */

export const RARITIES = [
  { key: "common", label: "Ширпотреб", color: "#9aa4b2" },
  { key: "uncommon", label: "Промышленное", color: "#5e9bd8" },
  { key: "rare", label: "Армейское", color: "#4b69ff" },
  { key: "epic", label: "Запрещённое", color: "#8847ff" },
  { key: "legendary", label: "Засекреченное", color: "#d32ce6" },
  { key: "mythical", label: "Тайное", color: "#ff9a3c" },
  { key: "exotic", label: "Контрабанда", color: "#ff3b3b" },
] as const;

export type RarityKey = (typeof RARITIES)[number]["key"];

export function rarity(key: string) {
  return RARITIES.find((r) => r.key === key) ?? RARITIES[0];
}

export const EXTERIORS = [
  "Factory New",
  "Minimal Wear",
  "Field-Tested",
  "Well-Worn",
  "Battle-Scarred",
] as const;

export const STATUSES = [
  { key: "pending", label: "На модерации", color: "#f5c451" },
  { key: "approved", label: "Опубликовано", color: "#4ade80" },
  { key: "rejected", label: "Отклонено", color: "#ff5f6d" },
] as const;

export function statusInfo(key: string) {
  return STATUSES.find((s) => s.key === key) ?? STATUSES[0];
}

export const ROLES = [
  { key: "user", label: "Покупатель" },
  { key: "author", label: "Автор" },
  { key: "admin", label: "Администратор" },
] as const;

export function roleLabel(key: string) {
  return ROLES.find((r) => r.key === key)?.label ?? key;
}

export function money(kopecks: number) {
  const value = (kopecks ?? 0) / 100;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ₽`;
}

export function parseMoneyToKopecks(input: string | number | null | undefined) {
  if (input === null || input === undefined) return 0;
  const raw = String(input).replace(/\s/g, "").replace(",", ".");
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function slugify(input: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  const base = input
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || `post-${Date.now()}`;
}

/** YouTube / Vimeo / прямая ссылка -> URL для iframe-вставки. */
export function embedUrl(url: string) {
  if (!url) return "";
  const trimmed = url.trim();
  const yt =
    trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/) ??
    null;
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return trimmed;
}

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

export const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/zip",
  "text/plain",
  "text/markdown",
];

export function mediaHref(mediaId: number | null | undefined, fallback?: string | null) {
  if (mediaId) return `/api/media/${mediaId}`;
  return fallback && fallback.length > 0 ? fallback : null;
}

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
