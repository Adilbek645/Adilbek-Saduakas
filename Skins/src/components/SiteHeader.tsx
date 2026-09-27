import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { money, roleLabel } from "@/lib/ui";

const NAV = [
  { href: "/skins", label: "Скины" },
  { href: "/cases", label: "Кейсы" },
  { href: "/blog", label: "Блог" },
  { href: "/#market", label: "Как это работает" },
];

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center bg-gradient-to-br from-neon to-cyan clip-corner-sm">
            <span className="font-mono text-sm font-black text-void">SF</span>
          </span>
          <span className="display text-xl tracking-wide text-white">
            SKIN<span className="text-cyan">FORGE</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-slate-400 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-3 border border-line bg-panel px-3 py-1.5 clip-corner-sm sm:flex">
                <span className="mono-label">Баланс</span>
                <span className="font-mono text-sm font-bold text-lime">{money(user.balance)}</span>
              </div>
              <Link
                href={user.role === "admin" ? "/admin" : user.role === "author" ? "/studio" : "/dashboard"}
                className="btn btn-ghost !px-3 !py-2"
                title={roleLabel(user.role)}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-neon to-ember text-[0.65rem] font-black text-void">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden lg:inline">{user.username}</span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-ghost !px-3 !py-2" title="Выйти">
                  ⏻
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Вход
              </Link>
              <Link href="/register" className="btn btn-primary">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-t border-line/60 px-4 py-1.5 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-slate-400"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
