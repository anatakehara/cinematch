"use client";

import { useEffect, useRef, useState } from "react";
import StarRating from "@/components/StarRating";
import { buscarDetalhes, type Filme, type FilmeDetalhe } from "@/lib/api";
import { generoPt } from "@/lib/generos";
import { alternarQuero, avaliar, removerVisto, useListas } from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

function formatarDuracao(min?: number | null) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

type Props = {
  filme: Filme;
  onClose: () => void;
  onRemoverFavorito?: (id: number) => void;
};

export default function MovieDialog({ filme, onClose, onRemoverFavorito }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [detalhe, setDetalhe] = useState<FilmeDetalhe | null>(null);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("carregando");
  const { noQuero, notaDe } = useListas();

  const quero = noQuero(filme.movieId);
  const nota = notaDe(filme.movieId);
  const titulo = tituloLegivel(filme.title);
  const info = detalhe ?? filme;
  const duracao = formatarDuracao(info.duracao);

  useEffect(() => {
    const dialogo = ref.current;
    if (dialogo && !dialogo.open) dialogo.showModal();

    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);

  useEffect(() => {
    const controle = new AbortController();
    buscarDetalhes(filme.movieId, controle.signal)
      .then((d) => {
        setDetalhe(d);
        setEstado("ok");
      })
      .catch((erro) => {
        if ((erro as Error).name !== "AbortError") setEstado("erro");
      });
    return () => controle.abort();
  }, [filme.movieId]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialogo-titulo"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      className="m-auto max-h-[90vh] w-[min(92vw,56rem)] overflow-hidden rounded-2xl border border-[var(--borda)] bg-[var(--poltrona)] p-0 text-[var(--texto)] backdrop:bg-black/70"
    >
      <div className="relative grid max-h-[90vh] gap-6 overflow-y-auto p-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:p-6">
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Fechar detalhes"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--borda)] bg-[var(--sala)] text-lg hover:text-[var(--feixe-claro)]"
        >
          ×
        </button>

        <div className="mx-auto w-full max-w-[200px] sm:max-w-none">
          {filme.poster_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={filme.poster_url}
              alt={`Pôster de ${titulo}`}
              className="aspect-[2/3] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-[var(--borda)] p-3 text-center text-sm">
              {titulo}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4 pr-6 sm:pr-8">
          <div>
            <h2 id="dialogo-titulo" className="text-3xl font-bold leading-tight">
              {titulo}
            </h2>
            <p className="suave mt-1 flex flex-wrap items-center gap-x-3 text-sm">
              {info.year && <span className="tabular-nums">{info.year}</span>}
              {duracao && <span>{duracao}</span>}
              {info.nota != null && (
                <span>TMDB {info.nota.toFixed(1).replace(".", ",")}/10</span>
              )}
            </p>
          </div>

          <ul className="flex flex-wrap gap-2" aria-label="Gêneros">
            {filme.genres.map((g) => (
              <li
                key={g}
                className="rounded-full border border-[var(--borda)] px-3 py-1 text-xs"
              >
                {generoPt(g)}
              </li>
            ))}
          </ul>

          {estado === "carregando" && (
            <div className="animate-pulse space-y-2" aria-hidden="true">
              <div className="h-4 w-full rounded bg-[var(--borda)]" />
              <div className="h-4 w-11/12 rounded bg-[var(--borda)]" />
              <div className="h-4 w-2/3 rounded bg-[var(--borda)]" />
            </div>
          )}

          {estado === "erro" && (
            <p className="suave text-sm" role="alert">
              Não consegui carregar a sinopse. Se a API estava parada, ela leva
              até 1 minuto para acordar. Feche e tente de novo.
            </p>
          )}

          {estado === "ok" && detalhe && (
            <div className="space-y-4 text-sm">
              {detalhe.overview && (
                <div>
                  <h3 className="font-semibold">
                    Sinopse <span className="suave text-xs font-normal">(em inglês)</span>
                  </h3>
                  <p className="suave mt-1 max-w-prose leading-relaxed">
                    {detalhe.overview}
                  </p>
                </div>
              )}

              {detalhe.directors.length > 0 && (
                <p>
                  <span className="font-semibold">Direção: </span>
                  <span className="suave">{detalhe.directors.join(", ")}</span>
                </p>
              )}

              {detalhe.cast.length > 0 && (
                <p>
                  <span className="font-semibold">Elenco: </span>
                  <span className="suave">{detalhe.cast.join(", ")}</span>
                </p>
              )}

              <p className="suave text-xs">
                {detalhe.n_avaliacoes.toLocaleString("pt-BR")}{" "}
                {detalhe.n_avaliacoes === 1 ? "avaliação" : "avaliações"} no
                MovieLens.
              </p>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[var(--borda)] pt-4 text-sm">
            <button
              type="button"
              className="chip"
              aria-pressed={quero}
              disabled={nota > 0}
              onClick={() => alternarQuero(info)}
            >
              {quero ? "Na lista" : "Quero assistir"}
            </button>

            <div className="suave flex items-center gap-1">
              <span>Já vi</span>
              <StarRating
                nota={nota}
                titulo={titulo}
                onChange={(n) =>
                  n === nota ? removerVisto(filme.movieId) : avaliar(info, n)
                }
              />
            </div>

            {onRemoverFavorito && (
              <button
                type="button"
                className="ml-auto text-xs underline underline-offset-4 hover:text-[var(--feixe-claro)]"
                onClick={() => {
                  onRemoverFavorito(filme.movieId);
                  ref.current?.close();
                }}
              >
                Remover dos favoritos
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}