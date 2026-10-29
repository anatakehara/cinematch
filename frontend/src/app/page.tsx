"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import type { Filme } from "@/lib/api";

const MAX_FAVORITOS = 5;

export default function Home() {
  const [favoritos, setFavoritos] = useState<Filme[]>([]);

  function adicionar(filme: Filme) {
    setFavoritos((atuais) => {
      const jaTem = atuais.some((f) => f.movieId === filme.movieId);
      if (jaTem || atuais.length >= MAX_FAVORITOS) return atuais;
      return [...atuais, filme];
    });
  }

  function remover(id: number) {
    setFavoritos((atuais) => atuais.filter((f) => f.movieId !== id));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-bold">CineMatch</h1>
        <p className="mt-2 text-neutral-500">
          Escolha até {MAX_FAVORITOS} filmes que você ama e descubra o que
          assistir em seguida.
        </p>
      </header>

      <SearchBar onSelect={adicionar} />

      <section className="w-full">
        <h2 className="mb-3 text-sm font-medium text-neutral-500">
          Seus favoritos ({favoritos.length}/{MAX_FAVORITOS})
        </h2>

        {favoritos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            Nenhum filme escolhido ainda. Use a busca acima.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {favoritos.map((filme) => (
              <li key={filme.movieId} className="relative">
                {filme.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={filme.poster_url}
                    alt={`Pôster de ${filme.title}`}
                    className="aspect-[2/3] w-full rounded-lg object-cover shadow"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-neutral-200 p-2 text-center text-xs dark:bg-neutral-800">
                    {filme.title}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remover(filme.movieId)}
                  aria-label={`Remover ${filme.title}`}
                  className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}