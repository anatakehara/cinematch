"use client";

import { useEffect, useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import MovieCard, { MovieCardSkeleton } from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import {
  buscarGeneros,
  FILTROS_VAZIOS,
  recomendar,
  type Filme,
  type Filtros,
  type Recomendacao,
} from "@/lib/api";
import { tituloLegivel } from "@/lib/titulo";

const MAX_FAVORITOS = 5;

export default function Home() {
  const [favoritos, setFavoritos] = useState<Filme[]>([]);
  const [surpresa, setSurpresa] = useState(0.6); // 0.6 equivale ao alpha = 0.4 do modelo
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [generos, setGeneros] = useState<string[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("ok");

  const idsKey = favoritos.map((f) => f.movieId).join(",");
  const filtrosKey = JSON.stringify(filtros);
  const alpha = Number((1 - surpresa).toFixed(2));

  useEffect(() => {
    buscarGeneros()
      .then(setGeneros)
      .catch(() => setGeneros([]));
  }, []);

  useEffect(() => {
    if (!idsKey) return;

    const ids = idsKey.split(",").map(Number);
    const filtrosAtuais: Filtros = JSON.parse(filtrosKey);
    const controle = new AbortController();
    const espera = setTimeout(async () => {
      setEstado("carregando");
      try {
        setRecomendacoes(
          await recomendar(ids, alpha, filtrosAtuais, controle.signal),
        );
        setEstado("ok");
      } catch (erro) {
        if ((erro as Error).name !== "AbortError") setEstado("erro");
      }
    }, 300);

    return () => {
      clearTimeout(espera);
      controle.abort();
    };
  }, [idsKey, alpha, filtrosKey]);

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
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-8 px-4 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-bold">🎬 CineMatch</h1>
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
                    alt={`Pôster de ${tituloLegivel(filme.title)}`}
                    className="aspect-[2/3] w-full rounded-lg object-cover shadow"
                  />
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg bg-neutral-200 p-2 text-center text-xs dark:bg-neutral-800">
                    {tituloLegivel(filme.title)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remover(filme.movieId)}
                  aria-label={`Remover ${tituloLegivel(filme.title)}`}
                  className="absolute right-1 top-1 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {favoritos.length > 0 && (
        <>
          <section className="w-full max-w-xl">
            <label
              htmlFor="surpresa"
              className="mb-1 block text-sm font-medium text-neutral-500"
            >
              Que tipo de recomendação você quer?
            </label>
            <input
              id="surpresa"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={surpresa}
              onChange={(e) => setSurpresa(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Mais parecido</span>
              <span>Mais surpreendente</span>
            </div>
          </section>

          <FilterPanel
            filtros={filtros}
            generos={generos}
            onChange={setFiltros}
          />

          <section className="w-full">
            <h2 className="mb-3 text-lg font-semibold">Recomendados para você</h2>

            {estado === "erro" && (
              <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                Não consegui buscar as recomendações. A API está rodando?
              </p>
            )}

            {estado === "carregando" && (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </ul>
            )}

            {estado === "ok" && recomendacoes.length === 0 && (
              <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                Nenhum filme encontrado com esses filtros. Tente afrouxar algum
                deles.
              </p>
            )}

            {estado === "ok" && recomendacoes.length > 0 && (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {recomendacoes.map((filme) => (
                  <MovieCard key={filme.movieId} filme={filme} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}