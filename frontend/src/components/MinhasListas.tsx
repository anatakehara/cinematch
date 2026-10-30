"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";
import type { Filme } from "@/lib/api";
import { avaliar, removerQuero, removerVisto, useListas } from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

function Capa({ filme }: { filme: Filme }) {
  const titulo = tituloLegivel(filme.title);
  return filme.poster_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={filme.poster_url}
      alt={`Pôster de ${titulo}`}
      loading="lazy"
      className="aspect-[2/3] w-full rounded-lg object-cover shadow"
    />
  ) : (
    <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-neutral-200 p-2 text-center text-xs dark:bg-neutral-800">
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
      className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-red-600"
    >
      ×
    </button>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
      {texto}
    </p>
  );
}

const GRADE = "grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6";

export default function MinhasListas() {
  const { quero, vistos } = useListas();
  const [aba, setAba] = useState<"quero" | "vistos">("quero");

  if (quero.length === 0 && vistos.length === 0) return null;

  const abas = [
    { id: "quero", rotulo: "Quero assistir", total: quero.length },
    { id: "vistos", rotulo: "Já vi", total: vistos.length },
  ] as const;

  return (
    <section className="w-full" aria-label="Minhas listas">
      <h2 className="mb-3 text-lg font-semibold">Minhas listas</h2>

      <div role="tablist" className="mb-4 flex gap-2">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              aba === a.id
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-neutral-300 hover:border-violet-400 dark:border-neutral-700"
            }`}
          >
            {a.rotulo} ({a.total})
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {aba === "quero" &&
          (quero.length === 0 ? (
            <Vazio texto="Nada aqui ainda. Use + Quero assistir nos cards." />
          ) : (
            <ul className={GRADE}>
              {quero.map((filme) => (
                <li key={filme.movieId} className="relative">
                  <Capa filme={filme} />
                  <BotaoRemover
                    titulo={tituloLegivel(filme.title)}
                    onClick={() => removerQuero(filme.movieId)}
                  />
                  <p className="mt-1 truncate text-xs">
                    {tituloLegivel(filme.title)}
                  </p>
                </li>
              ))}
            </ul>
          ))}

        {aba === "vistos" &&
          (vistos.length === 0 ? (
            <Vazio texto="Nenhum filme avaliado ainda. Dê estrelas nos cards." />
          ) : (
            <ul className={GRADE}>
              {vistos.map((filme) => (
                <li key={filme.movieId} className="relative">
                  <Capa filme={filme} />
                  <BotaoRemover
                    titulo={tituloLegivel(filme.title)}
                    onClick={() => removerVisto(filme.movieId)}
                  />
                  <p className="mt-1 truncate text-xs">
                    {tituloLegivel(filme.title)}
                  </p>
                  <StarRating
                    nota={filme.nota}
                    titulo={tituloLegivel(filme.title)}
                    onChange={(n) => avaliar(filme, n)}
                  />
                </li>
              ))}
            </ul>
          ))}
      </div>
    </section>
  );
}