import { CaseCard, SectionTitle } from "@/components/Cards";
import { listCases } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const [cases, user] = await Promise.all([listCases(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <SectionTitle kicker="Рулетка" title={`Кейсы · ${cases.length}`} />
      <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-slate-400">
        Каждый кейс содержит только проверенные администратором предметы. Шансы указаны для
        каждой позиции отдельно — никаких скрытых таблиц. Открытие списывает средства с баланса
        личного кабинета и сразу кладёт предмет в инвентарь.
      </p>

      {cases.length === 0 ? (
        <div className="panel clip-corner p-10 text-center text-sm text-slate-400">
          Пока нет одобренных кейсов — они появятся после модерации.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((box) => (
            <CaseCard key={box.id} box={box} />
          ))}
        </div>
      )}

      {user ? null : (
        <div className="panel clip-corner mt-10 p-6 text-center">
          <p className="display text-2xl text-white">Нужен личный кабинет</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Кейсы открываются только авторизованным покупателям — так мы привязываем дропы
            к инвентарю и истории заказов.
          </p>
        </div>
      )}
    </div>
  );
}
