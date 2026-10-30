"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";
import type { Filme } from "@/lib/api";
import { avaliar, removerQuero, removerVisto, useListas } from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

const INICIAL = 6;

function Capa({ filme }: { filme: Filme }) {
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
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-[var(--borda)] p-1 text-center text-[10px]">
      {titulo}
    </div>
  );
}

function BotaoRemover({ titulo, onClick }: { titulo: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Remover ${titulo}`}
      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--borda)] bg-[var(--sala)] text-sm hover:text-[var(--feixe-claro)]"
    >
      ×
    </button>
  );
}

export default function MinhasListas() {
  const { quero, vistos } = useListas();
  const [aba, setAba] = useState<"quero" | "vistos">("quero");
  const [todos, setTodos] = useState(false);

  if (quero.length === 0 && vistos.length === 0) return null;

  const itens = aba === "quero" ? quero : vistos;
  const visiveis = todos ? itens : itens.slice(0, INICIAL);

  function trocar(nova: "quero" | "vistos") {
    setAba(nova);
    setTodos(false);
  }

  return (
    <section className="painel p-4" aria-labelledby="titulo-listas">
      <h2 id="titulo-listas" className="mb-3 text-lg font-semibold">
        Minhas listas
      </h2>

      <div role="group" aria-label="Escolher lista" className="mb-4 flex gap-2">
        <button
          type="button"
          className="chip"
          aria-pressed={aba === "quero"}
          onClick={() => trocar("quero")}
        >
          Quero assistir ({quero.length})
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={aba === "vistos"}
          onClick={() => trocar("vistos")}
        >
          Já vi ({vistos.length})
        </button>
      </div>

      {itens.length === 0 ? (
        <p className="suave text-sm">
          {aba === "quero"
            ? "Nada aqui ainda. Use Quero assistir nos cards."
            : "Nenhum filme avaliado ainda. Dê estrelas nos cards."}
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-3">
            {visiveis.map((filme) => {
              const titulo = tituloLegivel(filme.title);
              const visto = "nota" in filme ? filme : null;
              return (
                <li key={filme.movieId} className="relative min-w-0">
                  <Capa filme={filme} />
                  <BotaoRemover
                    titulo={titulo}
                    onClick={() =>
                      aba === "quero"
                        ? removerQuero(filme.movieId)
                        : removerVisto(filme.movieId)
                    }
                  />
                  <p className="mt-1 truncate text-[11px] leading-tight">
                    {titulo}
                  </p>
                  {visto && (
                    <StarRating
                      compacto
                      nota={visto.nota}
                      titulo={titulo}
                      onChange={(n) => avaliar(filme, n)}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {itens.length > INICIAL && (
            <button
              type="button"
              onClick={() => setTodos(!todos)}
              className="mt-3 text-xs text-[var(--feixe-claro)] underline underline-offset-4"
            >
              {todos ? "Ver menos" : `Ver todos (${itens.length})`}
            </button>
          )}
        </>
      )}
    </section>
  );
}