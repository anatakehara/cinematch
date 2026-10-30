"use client";

import StarRating from "@/components/StarRating";
import type { Recomendacao } from "@/lib/api";
import { generoPt } from "@/lib/generos";
import { alternarQuero, avaliar, removerVisto, useListas } from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

function Poster({ filme }: { filme: Recomendacao }) {
  const titulo = tituloLegivel(filme.title);
  return filme.poster_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={filme.poster_url}
      alt={`Pôster de ${titulo}`}
      loading="lazy"
      className="aspect-[2/3] w-full rounded-md object-cover"
    />
  ) : (
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-[var(--poltrona)] p-3 text-center text-sm">
      {titulo}
    </div>
  );
}

function formatarDuracao(min?: number | null) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

function Meta({
  filme,
  className = "text-xs",
}: {
  filme: Recomendacao;
  className?: string;
}) {
  const duracao = formatarDuracao(filme.duracao);
  const generos = filme.genres.slice(0, 2).map(generoPt).join(", ");

  return (
    <p className={`suave flex flex-wrap items-center gap-x-2 ${className}`}>
      {filme.year && <span className="tabular-nums">{filme.year}</span>}
      {duracao && <span>{duracao}</span>}
      {filme.nota != null && (
        <span className="flex items-center gap-1">
          <span aria-hidden="true" className="text-[var(--feixe-claro)]">
            ★
          </span>
          <span className="sr-only">Nota </span>
          {filme.nota.toFixed(1).replace(".", ",")}
        </span>
      )}
      {generos && <span>{generos}</span>}
    </p>
  );
}

function Acoes({ filme }: { filme: Recomendacao }) {
  const { noQuero, notaDe } = useListas();
  const quero = noQuero(filme.movieId);
  const nota = notaDe(filme.movieId);
  const titulo = tituloLegivel(filme.title);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs">
      <button
        type="button"
        className="chip"
        aria-pressed={quero}
        disabled={nota > 0}
        onClick={() => alternarQuero(filme)}
      >
        {quero ? "Na lista" : "Quero assistir"}
      </button>

      <div className="suave flex items-center gap-1">
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
  );
}

export default function MovieCard({ filme }: { filme: Recomendacao }) {
  const titulo = tituloLegivel(filme.title);
  const origem = filme.because.length
    ? "Porque você gostou de " + filme.because.map(tituloLegivel).join(" e ")
    : "Combina com seus favoritos";

  return (
    <li className="flex flex-col gap-3">
      <Poster filme={filme} />

      <div>
        <h3 className="text-base font-semibold leading-snug">{titulo}</h3>
        <Meta filme={filme} />
      </div>

      <p className="suave border-l-2 border-[var(--feixe)] pl-2 text-xs">
        {origem}
      </p>

      <details className="suave text-xs">
        <summary className="cursor-pointer select-none underline underline-offset-4">
          Ver por quê
        </summary>
        <p className="mt-2 leading-relaxed">{filme.explanation}</p>
      </details>

      <Acoes filme={filme} />
    </li>
  );
}

export function FeaturedCard({ filme }: { filme: Recomendacao }) {
  const titulo = tituloLegivel(filme.title);

  return (
    <article className="relative grid gap-6 overflow-hidden rounded-2xl bg-[var(--poltrona)] p-5 sm:grid-cols-[200px_1fr] sm:p-6 md:grid-cols-[240px_1fr]">
      {/* o feixe do projetor: o único brilho da página */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--feixe)" }}
      />

      <div className="relative mx-auto w-full max-w-[240px] sm:max-w-none">
        <Poster filme={filme} />
      </div>

      <div className="relative flex flex-col justify-center gap-4">
        <div>
          <h3 className="text-3xl font-bold leading-tight sm:text-4xl">
            {titulo}
          </h3>
          <Meta filme={filme} className="text-sm" />
        </div>

        <p className="suave max-w-prose border-l-2 border-[var(--feixe)] pl-3 text-sm leading-relaxed">
          {filme.explanation}
        </p>

        <Acoes filme={filme} />
      </div>
    </article>
  );
}

export function MovieCardSkeleton() {
  return (
    <li className="animate-pulse space-y-3">
      <div className="aspect-[2/3] rounded-md bg-[var(--poltrona)]" />
      <div className="h-4 w-3/4 rounded bg-[var(--poltrona)]" />
      <div className="h-3 w-1/2 rounded bg-[var(--poltrona)]" />
    </li>
  );
}

export function FeaturedSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 rounded-2xl bg-[var(--poltrona)] p-5 sm:grid-cols-[200px_1fr] sm:p-6 md:grid-cols-[240px_1fr]">
      <div className="mx-auto aspect-[2/3] w-full max-w-[240px] rounded-md bg-[var(--borda)] sm:max-w-none" />
      <div className="space-y-4 self-center">
        <div className="h-8 w-2/3 rounded bg-[var(--borda)]" />
        <div className="h-4 w-1/3 rounded bg-[var(--borda)]" />
        <div className="h-16 w-full rounded bg-[var(--borda)]" />
      </div>
    </div>
  );
}