"use client";

import { useAbrirDetalhes } from "@/components/DetalhesProvider";
import StarRating from "@/components/StarRating";
import type { Recomendacao } from "@/lib/api";
import { generoPt } from "@/lib/generos";
import { alternarQuero, avaliar, removerVisto, useListas } from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

function formatarDuracao(min?: number | null) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

function Poster({ filme }: { filme: Recomendacao }) {
  const abrir = useAbrirDetalhes();
  const titulo = tituloLegivel(filme.title);

  return (
    <button
      type="button"
      onClick={() => abrir(filme)}
      aria-label={`Ver detalhes de ${titulo}`}
      className="block w-full cursor-pointer overflow-hidden rounded-md transition hover:brightness-110"
    >
      {filme.poster_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={filme.poster_url}
          alt=""
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-[var(--poltrona)] p-3 text-center text-sm">
          {titulo}
        </div>
      )}
    </button>
  );
}

function Titulo({
  filme,
  className,
}: {
  filme: Recomendacao;
  className: string;
}) {
  const abrir = useAbrirDetalhes();
  return (
    <h3 className={className}>
      <button
        type="button"
        onClick={() => abrir(filme)}
        className="cursor-pointer text-left underline-offset-4 hover:underline"
      >
        {tituloLegivel(filme.title)}
      </button>
    </h3>
  );
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
        <span title="Nota do público no TMDB, de 0 a 10">
          <span aria-hidden="true" className="text-[var(--feixe-claro)]">
            ★{" "}
          </span>
          <span className="sr-only">Nota do público no TMDB: </span>
          {filme.nota.toFixed(1).replace(".", ",")}/10
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
  const origem = filme.because.length
    ? "Porque você gostou de " + filme.because.map(tituloLegivel).join(" e ")
    : "Combina com seus favoritos";

  return (
    <li className="flex flex-col gap-3">
      <Poster filme={filme} />

      <div>
        <Titulo filme={filme} className="text-base font-semibold leading-snug" />
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
  return (
    <article className="relative grid gap-6 overflow-hidden rounded-2xl bg-[var(--poltrona)] p-5 sm:grid-cols-[200px_1fr] sm:p-6 md:grid-cols-[240px_1fr]">
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
          <Titulo
            filme={filme}
            className="text-3xl font-bold leading-tight sm:text-4xl"
          />
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