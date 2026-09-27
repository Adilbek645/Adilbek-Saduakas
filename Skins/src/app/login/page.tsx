import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { Notice } from "@/components/Cards";

export const dynamic = "force-dynamic";

const DEMO = [
  ["Администратор", "admin@skinvault.gg", "admin123", "Модерация скинов, кейсов, статей и пользователей"],
  ["Автор", "author@skinvault.gg", "author123", "Загрузка материалов в блог и каталог"],
  ["Покупатель", "buyer@skinvault.gg", "buyer123", "Баланс, инвентарь, покупки и кейсы"],
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : user.role === "author" ? "/studio" : "/dashboard");
  const { error } = await searchParams;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_1.1fr]">
      <div className="panel panel-glow clip-corner p-8">
        <p className="mono-label">Вход в систему</p>
        <h1 className="display mt-2 text-4xl text-white">Личный кабинет</h1>
        <p className="mt-3 text-sm text-slate-400">
          Единая точка входа для покупателей, авторов и администраторов.
        </p>

        {error ? (
          <div className="mt-6">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <div>
            <label className="mono-label" htmlFor="identity">
              E-mail или никнейм
            </label>
            <input id="identity" name="identity" required className="field mt-1.5" placeholder="buyer@skinvault.gg" />
          </div>
          <div>
            <label className="mono-label" htmlFor="password">
              Пароль
            </label>
            <input id="password" name="password" type="password" required className="field mt-1.5" placeholder="••••••" />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Войти
          </button>
        </form>

        <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-cyan hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        <div className="panel clip-corner p-6">
          <p className="mono-label">Демо-доступы для проверки</p>
          <div className="mt-4 space-y-3">
            {DEMO.map(([role, email, pass, note]) => (
              <div key={email} className="border border-line bg-void/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-cyan">{role}</span>
                  <span className="font-mono text-xs text-white">{email}</span>
                  <span className="font-mono text-xs text-lime">{pass}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel clip-corner grid-lines p-6">
          <p className="display text-2xl text-white">Три кабинета в одном сайте</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>💠 <span className="text-white">Покупатель</span> — баланс, заказы, инвентарь, избранное.</li>
            <li>✍ <span className="text-white">Автор</span> — скины, кейсы и статьи с вложениями.</li>
            <li>🛡 <span className="text-white">Администратор</span> — разрешение публикаций и роли.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
