"use client";

import { useListas } from "@/lib/listas";
import {
  idsCurtidos,
  perfilDecadas,
  perfilGeneros,
  resumo,
  type Barra,
} from "@/lib/perfil";

function Grafico({ titulo, barras }: { titulo: string; barras: Barra[] }) {
  if (barras.length === 0) return null;
  const maximo = Math.max(...barras.map((b) => b.curtidos));

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-neutral-500">{titulo}</h3>
      <ul className="space-y-2">
        {barras.map((b) => (
          <li key={b.rotulo}>
            <div className="mb-0.5 flex justify-between gap-2 text-xs">
              <span>{b.rotulo}</span>
              <span className="text-neutral-500">
                {b.curtidos} {b.curtidos === 1 ? "filme" : "filmes"} · nota média{" "}
                {b.notaMedia.toFixed(1).replace(".", ",")}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-violet-600"
                style={{ width: `${(b.curtidos / maximo) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props = { onRecomendar: (ids: number[]) => void; ativo: boolean };

export default function PerfilGosto({ onRecomendar, ativo }: Props) {
  const { vistos } = useListas();
  if (vistos.length === 0) return null;

  const { total, curtidos, media } = resumo(vistos);
  const ids = idsCurtidos(vistos);

  return (
    <section
      className="w-full space-y-5 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
      aria-label="Seu perfil de gosto"
    >
      <div>
        <h2 className="text-lg font-semibold">Seu perfil de gosto</h2>
        <p className="text-sm text-neutral-500">
          {total} {total === 1 ? "filme avaliado" : "filmes avaliados"} ·{" "}
          {curtidos} com 4★ ou mais · nota média{" "}
          {media.toFixed(1).replace(".", ",")}
        </p>
        {total < 5 && (
          <p className="mt-1 text-xs text-neutral-500">
            Avalie mais filmes para o perfil ficar mais preciso.
          </p>
        )}
      </div>

      {curtidos > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <Grafico titulo="Gêneros que você curtiu" barras={perfilGeneros(vistos)} />
          <Grafico titulo="Décadas que você curtiu" barras={perfilDecadas(vistos)} />
        </div>
      ) : (
        <p className="text-sm text-neutral-500">
          Dê 4 ou 5 estrelas a algum filme para ver seus gêneros e décadas
          favoritos.
        </p>
      )}

      <button
        type="button"
        disabled={ids.length === 0}
        onClick={() => onRecomendar(ids)}
        className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-40"
      >
        {ativo
          ? "Atualizar com minhas avaliações"
          : "Recomendar a partir das minhas avaliações"}
      </button>
    </section>
  );
}