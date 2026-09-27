import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
      <p className="mono-label">Ошибка 404</p>
      <h1 className="display mt-3 text-6xl text-white">Предмет не найден</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
        Возможно, скин сняли с продажи, кейс отправлен на доработку или статья ещё проходит
        модерацию администратора.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/skins" className="btn btn-primary">
          В каталог скинов
        </Link>
        <Link href="/blog" className="btn btn-ghost">
          В блог
        </Link>
        <Link href="/" className="btn btn-ghost">
          На главную
        </Link>
      </div>
    </div>
  );
}
