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
    filtros.generos.length > 0 || filtros.decada !== null || filtros.notaMin > 0;

  function alternarGenero(g: string) {
    const novos = filtros.generos.includes(g)
      ? filtros.generos.filter((x) => x !== g)
      : [...filtros.generos, g];
    onChange({ ...filtros, generos: novos });
  }

  return (
    <section className="w-full space-y-4 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-500">Filtros</h2>
        {ativos && (
          <button
            type="button"
            onClick={() => onChange(FILTROS_VAZIOS)}
            className="text-xs text-violet-600 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs text-neutral-500">Gênero</p>
        <div className="flex flex-wrap gap-2">
          {generos.map((g) => {
            const marcado = filtros.generos.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={marcado}
                onClick={() => alternarGenero(g)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  marcado
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-neutral-300 hover:border-violet-400 dark:border-neutral-700"
                }`}
              >
                {generoPt(g)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="decada" className="mb-1 block text-xs text-neutral-500">
            Década
          </label>
          <select
            id="decada"
            value={filtros.decada ?? ""}
            onChange={(e) =>
              onChange({
                ...filtros,
                decada: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
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
          <label htmlFor="nota" className="mb-1 block text-xs text-neutral-500">
            Nota mínima:{" "}
            {filtros.notaMin > 0 ? filtros.notaMin.toFixed(1) : "qualquer"}
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
            className="w-full accent-violet-600"
          />
        </div>
      </div>
    </section>
  );
}