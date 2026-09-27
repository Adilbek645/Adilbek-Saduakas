import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { Notice } from "@/components/Cards";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : user.role === "author" ? "/studio" : "/dashboard");
  const { error } = await searchParams;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel panel-glow clip-corner p-8">
        <p className="mono-label">Регистрация</p>
        <h1 className="display mt-2 text-4xl text-white">Создать кабинет покупателя</h1>
        <p className="mt-3 text-sm text-slate-400">
          После регистрации вы получаете личный кабинет, приветственный баланс 500 ₽ и доступ
          к покупке скинов и открытию кейсов.
        </p>

        {error ? (
          <div className="mt-6">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}

        <form action={registerAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mono-label" htmlFor="username">
              Никнейм
            </label>
            <input id="username" name="username" required minLength={3} className="field mt-1.5" placeholder="SKINHUNTER" />
          </div>
          <div className="sm:col-span-2">
            <label className="mono-label" htmlFor="email">
              E-mail
            </label>
            <input id="email" name="email" type="email" required className="field mt-1.5" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mono-label" htmlFor="password">
              Пароль
            </label>
            <input id="password" name="password" type="password" required minLength={6} className="field mt-1.5" placeholder="от 6 символов" />
          </div>
          <div>
            <label className="mono-label" htmlFor="repeat">
              Повтор пароля
            </label>
            <input id="repeat" name="repeat" type="password" required minLength={6} className="field mt-1.5" placeholder="••••••" />
          </div>
          <label className="flex items-start gap-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-slate-500 sm:col-span-2">
            <input type="checkbox" required className="mt-0.5 accent-[#7c5cff]" />
            Соглашаюсь с правилами: все предметы виртуальные, контент публикуется после модерации
          </label>
          <button type="submit" className="btn btn-primary sm:col-span-2">
            Зарегистрироваться
          </button>
        </form>

        <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-widest text-slate-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-cyan hover:underline">
            Войти
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        <div className="panel clip-corner p-6">
          <p className="mono-label">Что внутри кабинета</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li><span className="text-lime">◆</span> Баланс с пополнением и историей списаний</li>
            <li><span className="text-lime">◆</span> Инвентарь купленных и выпавших предметов</li>
            <li><span className="text-lime">◆</span> Продажа предметов магазину по 70% цены</li>
            <li><span className="text-lime">◆</span> Избранные скины и профиль с аватаром</li>
            <li><span className="text-lime">◆</span> Отправка статей и скинов на модерацию</li>
          </ul>
        </div>
        <div className="panel clip-corner grid-lines p-6">
          <p className="display text-2xl text-white">Как стать автором?</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Отправьте первый материал через студию — администратор увидит его в очереди модерации
            и сможет выдать вам роль «Автор» для постоянной публикации.
          </p>
          <Link href="/studio" className="btn btn-ghost mt-4">
            Перейти в студию
          </Link>
        </div>
      </div>
    </div>
  );
}
