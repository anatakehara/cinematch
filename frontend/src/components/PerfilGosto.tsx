"use client";

import { useListas } from "@/lib/listas";
import {
  idsCurtidos,
  perfilDecadas,
  perfilGeneros,
  resumo,
  type Barra,
} from "@/lib/perfil";

const CORES = [
  "#7c4dff",
  "#4da3ff",
  "#2dd4bf",
  "#8bd450",
  "#ff9f43",
  "#ff6b9d",
  "#8a84a8",
];

function Grafico({ titulo, barras }: { titulo: string; barras: Barra[] }) {
  if (barras.length === 0) return null;
  const maximo = Math.max(...barras.map((b) => b.pct), 1);

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{titulo}</h3>
      <ul className="space-y-2">
        {barras.map((b, i) => {
          const cor =
            b.rotulo === "Outros"
              ? CORES[CORES.length - 1]
              : CORES[i % (CORES.length - 1)];
          return (
            <li
              key={b.rotulo}
              title={`Nota média dos seus filmes aqui: ${b.notaMedia
                .toFixed(1)
                .replace(".", ",")} de 5`}
              className="grid grid-cols-[0.5rem_5.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ background: cor }}
              />
              <span className="truncate">{b.rotulo}</span>
              <span
                aria-hidden="true"
                className="h-1.5 overflow-hidden rounded-full bg-[var(--borda)]"
              >
                <span
                  className="block h-full rounded-full"
                  style={{ width: `${(b.pct / maximo) * 100}%`, background: cor }}
                />
              </span>
              <span className="suave text-right tabular-nums">{b.pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Props = {
  onRecomendar: (ids: number[]) => void;
  onVoltar: () => void;
  ativo: boolean;
};

export default function PerfilGosto({ onRecomendar, onVoltar, ativo }: Props) {
  const { vistos } = useListas();

  if (vistos.length === 0) {
    return (
      <section className="painel p-4" aria-label="Meu perfil de gosto">
        <h2 className="text-lg font-semibold">Meu perfil de gosto</h2>
        <p className="suave mt-1 text-sm">
          Dê estrelas aos filmes que você já viu. Seus gêneros e décadas
          favoritos aparecem aqui.
        </p>
      </section>
    );
  }

  const { total, curtidos, media } = resumo(vistos);
  const ids = idsCurtidos(vistos);

  return (
    <>
      <section className="painel space-y-5 p-4" aria-label="Meu perfil de gosto">
        <div>
          <h2 className="text-lg font-semibold">Meu perfil de gosto</h2>
          <p className="suave text-xs">
            {total} {total === 1 ? "filme avaliado" : "filmes avaliados"} ·{" "}
            {curtidos} com 4★ ou mais · nota média{" "}
            {media.toFixed(1).replace(".", ",")}
          </p>
          {total < 5 && (
            <p className="suave mt-1 text-xs">
              Avalie mais filmes para o perfil ficar mais preciso.
            </p>
          )}
        </div>

        {curtidos > 0 ? (
          <>
            <Grafico titulo="Gêneros" barras={perfilGeneros(vistos)} />
            <Grafico titulo="Décadas" barras={perfilDecadas(vistos)} />
          </>
        ) : (
          <p className="suave text-sm">
            Dê 4 ou 5 estrelas a algum filme para ver seus gêneros e décadas
            favoritos.
          </p>
        )}
      </section>

      <section className="painel flex items-start gap-3 p-4">
        <div className="flex-1">
          <h2 id="sw-titulo" className="text-sm font-semibold">
            Recomendar a partir das minhas avaliações
          </h2>
          <p id="sw-desc" className="suave mt-1 text-xs">
            {ids.length === 0
              ? "Dê 4 ou 5 estrelas a algum filme para ativar."
              : "Usa seus filmes com 4★ ou mais e nunca repete um filme já visto."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          aria-labelledby="sw-titulo"
          aria-describedby="sw-desc"
          disabled={!ativo && ids.length === 0}
          onClick={() => (ativo ? onVoltar() : onRecomendar(ids))}
          className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            ativo ? "bg-[var(--feixe)]" : "bg-[var(--borda)]"
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              ativo ? "translate-x-5" : ""
            }`}
          />
        </button>
      </section>
    </>
  );
}