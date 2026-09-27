import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "SkinForge — маркетплейс скинов и кейсов с блогом",
  description:
    "SkinForge: оригинальный маркетплейс игровых скинов и кейсов, блог с вложениями и личные кабинеты покупателей, авторов и администратора.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line bg-void/70">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="display text-2xl text-white">
                  SKIN<span className="text-cyan">FORGE</span>
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                  Кузница скинов: торговая площадка, кейсы с честными шансами и редакционный блог
                  про рынок игровых предметов.
                </p>
              </div>
              <div>
                <p className="mono-label">Каталог</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li><Link className="hover:text-cyan" href="/skins">Все скины</Link></li>
                  <li><Link className="hover:text-cyan" href="/cases">Кейсы</Link></li>
                  <li><Link className="hover:text-cyan" href="/blog">Блог</Link></li>
                </ul>
              </div>
              <div>
                <p className="mono-label">Кабинеты</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li><Link className="hover:text-cyan" href="/dashboard">Кабинет покупателя</Link></li>
                  <li><Link className="hover:text-cyan" href="/studio">Студия автора</Link></li>
                  <li><Link className="hover:text-cyan" href="/admin">Панель администратора</Link></li>
                </ul>
              </div>
              <div>
                <p className="mono-label">Демо-доступы</p>
                <ul className="mt-3 space-y-1.5 font-mono text-[0.68rem] uppercase tracking-widest text-slate-500">
                  <li>admin@skinvault.gg / admin123</li>
                  <li>author@skinvault.gg / author123</li>
                  <li>buyer@skinvault.gg / buyer123</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-line/70 px-4 py-4 text-center font-mono text-[0.62rem] uppercase tracking-[0.24em] text-slate-600">
              © {new Date().getFullYear()} SkinForge · Учебный проект · Все предметы виртуальные
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
