import type { Recomendacao } from "@/lib/api";
import { tituloLegivel } from "@/lib/titulo";

export default function MovieCard({ filme }: { filme: Recomendacao }) {
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
          alt={`Pôster de ${tituloLegivel(filme.title)}`}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-neutral-200 p-3 text-center text-sm dark:bg-neutral-800">
          {tituloLegivel(filme.title)}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="font-semibold leading-tight">
            {tituloLegivel(filme.title)}
          </h3>
          <p className="text-xs text-neutral-500">{detalhes}</p>
        </div>

        <p className="rounded-md bg-violet-100 px-2 py-1 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-200">
          {origem}
        </p>

        <details className="text-xs text-neutral-600 dark:text-neutral-400">
          <summary className="cursor-pointer select-none">Ver por quê</summary>
          <p className="mt-1">{filme.explanation}</p>
        </details>
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