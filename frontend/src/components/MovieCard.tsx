"use client";

import StarRating from "@/components/StarRating";
import type { Recomendacao } from "@/lib/api";
import { alternarQuero, avaliar, removerVisto, useListas } from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

export default function MovieCard({ filme }: { filme: Recomendacao }) {
  const { noQuero, notaDe } = useListas();
  const quero = noQuero(filme.movieId);
  const nota = notaDe(filme.movieId);
  const titulo = tituloLegivel(filme.title);

  const origem = filme.because.length
    ? "Porque você gostou de " + filme.because.map(tituloLegivel).join(" e ")
    : "Combina com seus favoritos";

  const detalhes = [filme.year, filme.genres.slice(0, 3).join(" · ")]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {filme.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={filme.poster_url}
          alt={`Pôster de ${titulo}`}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-neutral-200 p-3 text-center text-sm dark:bg-neutral-800">
          {titulo}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="font-semibold leading-tight">{titulo}</h3>
          <p className="text-xs text-neutral-500">{detalhes}</p>
        </div>

        <p className="rounded-md bg-violet-100 px-2 py-1 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-200">
          {origem}
        </p>

        <details className="text-xs text-neutral-600 dark:text-neutral-400">
          <summary className="cursor-pointer select-none">Ver por quê</summary>
          <p className="mt-1">{filme.explanation}</p>
        </details>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
          <button
            type="button"
            aria-pressed={quero}
            disabled={nota > 0}
            onClick={() => alternarQuero(filme)}
            className={`rounded-full border px-3 py-1 text-xs transition disabled:opacity-40 ${
              quero
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-neutral-300 hover:border-violet-400 dark:border-neutral-700"
            }`}
          >
            {quero ? "✓ Na lista" : "+ Quero assistir"}
          </button>

          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <span>Já vi</span>
            <StarRating
              nota={nota}
              titulo={titulo}
              onChange={(n) =>
                n === nota ? removerVisto(filme.movieId) : avaliar(filme, n)
              }
            />
          </div>
        </div>
      </div>
    </li>
  );
}

export function MovieCardSkeleton() {
  return (
    <li className="animate-pulse overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <div className="aspect-[2/3] bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-6 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </li>
  );
}