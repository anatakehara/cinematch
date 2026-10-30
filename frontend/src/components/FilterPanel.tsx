"use client";

import { FILTROS_VAZIOS, type Filtros } from "@/lib/api";
import { generoPt } from "@/lib/generos";

const DECADAS = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

type Props = {
  filtros: Filtros;
  generos: string[];
  onChange: (filtros: Filtros) => void;
};

export default function FilterPanel({ filtros, generos, onChange }: Props) {
  const ativos =
    filtros.generos.length +
    (filtros.decada !== null ? 1 : 0) +
    (filtros.notaMin > 0 ? 1 : 0);

  function alternarGenero(g: string) {
    const novos = filtros.generos.includes(g)
      ? filtros.generos.filter((x) => x !== g)
      : [...filtros.generos, g];
    onChange({ ...filtros, generos: novos });
  }

  return (
    <details className="group rounded-xl border border-[var(--borda)] bg-[var(--poltrona)]">
      <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-medium">
        <span>Filtros</span>
        <span className="suave flex items-center gap-2">
          {ativos > 0 ? `${ativos} ${ativos === 1 ? "ativo" : "ativos"}` : "nenhum"}
          <span
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </span>
      </summary>

      <div className="space-y-5 px-4 pb-4">
        <div>
          <p id="filtro-generos" className="suave mb-2 text-xs">
            Gênero (vale qualquer um dos marcados)
          </p>
          <div
            role="group"
            aria-labelledby="filtro-generos"
            className="flex flex-wrap gap-2"
          >
            {generos.map((g) => (
              <button
                key={g}
                type="button"
                className="chip"
                aria-pressed={filtros.generos.includes(g)}
                onClick={() => alternarGenero(g)}
              >
                {generoPt(g)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="decada" className="suave mb-1 block text-xs">
            Década
          </label>
          <select
            id="decada"
            className="campo"
            value={filtros.decada ?? ""}
            onChange={(e) =>
              onChange({
                ...filtros,
                decada: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Qualquer</option>
            {DECADAS.map((d) => (
              <option key={d} value={d}>
                Anos {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nota" className="suave mb-1 block text-xs">
            Nota mínima no TMDB:{" "}
            {filtros.notaMin > 0
              ? filtros.notaMin.toFixed(1).replace(".", ",")
              : "qualquer"}
          </label>
          <input
            id="nota"
            type="range"
            min={0}
            max={9}
            step={0.5}
            value={filtros.notaMin}
            onChange={(e) =>
              onChange({ ...filtros, notaMin: Number(e.target.value) })
            }
          />
        </div>

        {ativos > 0 && (
          <button
            type="button"
            onClick={() => onChange(FILTROS_VAZIOS)}
            className="text-sm text-[var(--feixe-claro)] underline underline-offset-4"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </details>
  );
}