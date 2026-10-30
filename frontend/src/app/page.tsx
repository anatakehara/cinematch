"use client";

import { useEffect, useState } from "react";
import FilterPanel from "@/components/FilterPanel";
import MinhasListas from "@/components/MinhasListas";
import MovieCard, {
  FeaturedCard,
  FeaturedSkeleton,
  MovieCardSkeleton,
} from "@/components/MovieCard";
import PerfilGosto from "@/components/PerfilGosto";
import SearchBar from "@/components/SearchBar";
import {
  buscarGeneros,
  FILTROS_VAZIOS,
  recomendar,
  type Filme,
  type Filtros,
  type Recomendacao,
} from "@/lib/api";
import {
  adicionarFavorito,
  idsVistos,
  removerFavorito,
  useListas,
} from "@/lib/listas";
import { tituloLegivel } from "@/lib/titulo";

const MAX_FAVORITOS = 5;

export default function Home() {
  const [baseAvaliacoes, setBaseAvaliacoes] = useState<number[] | null>(null);
  const [surpresa, setSurpresa] = useState(0.6);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);
  const [generos, setGeneros] = useState<string[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("ok");
  const [tentativa, setTentativa] = useState(0);
    const { quero, vistos, favoritos } = useListas();

  const idsBase = baseAvaliacoes ?? favoritos.map((f) => f.movieId);
  const idsKey = idsBase.join(",");
  const filtrosKey = JSON.stringify(filtros);
  const alpha = Number((1 - surpresa).toFixed(2));
  const temBase = idsKey !== "";
  const temListas = quero.length + vistos.length > 0;
  const [destaque, ...demais] = recomendacoes;

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
          await recomendar(ids, alpha, filtrosAtuais, idsVistos(), controle.signal),
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
  }, [idsKey, alpha, filtrosKey, tentativa]);

  function adicionar(filme: Filme) {
    setBaseAvaliacoes(null);
    adicionarFavorito(filme, MAX_FAVORITOS);
  }

  function remover(id: number) {
    setBaseAvaliacoes(null);
    removerFavorito(id);
  }
  
  function recomendarPorAvaliacoes(ids: number[]) {
    setBaseAvaliacoes(ids);
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() =>
      document.getElementById("recomendados")?.scrollIntoView({
        behavior: reduzir ? "auto" : "smooth",
        block: "start",
      }),
    );
  }

  return (
    <>
      <header className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 py-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">CineMatch</h1>
          <p className="suave text-sm">
            Diga o que você ama. Descubra o que ver depois.
          </p>
        </div>
        {temListas && (
          <a
            href="#listas"
            className="suave text-sm underline underline-offset-4 hover:text-[var(--texto)]"
          >
            Perfil e listas
          </a>
        )}
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:px-8">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
          <SearchBar
            onSelect={adicionar}
            idsEscolhidos={favoritos.map((f) => f.movieId)}
            limite={MAX_FAVORITOS}
          />

          <div className="flex min-h-0 flex-col gap-6 lg:overflow-y-auto lg:pr-1">
            <section aria-labelledby="titulo-favoritos">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="titulo-favoritos" className="text-lg font-semibold">
                  Seus favoritos
                </h2>
                <span className="suave text-xs">
                  {favoritos.length} de {MAX_FAVORITOS}
                </span>
              </div>

              <ul className="grid grid-cols-5 gap-2">
                {Array.from({ length: MAX_FAVORITOS }).map((_, i) => {
                  const filme = favoritos[i];
                  if (!filme) {
                    return (
                      <li
                        key={`vazio-${i}`}
                        aria-hidden="true"
                        className="aspect-[2/3] rounded-md border border-dashed border-[var(--borda)]"
                      />
                    );
                  }
                  const titulo = tituloLegivel(filme.title);
                  return (
                    <li key={filme.movieId} className="relative entrada">
                      {filme.poster_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={filme.poster_url}
                          alt={`Pôster de ${titulo}`}
                          className="aspect-[2/3] w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-md bg-[var(--poltrona)] p-1 text-center text-[10px]">
                          {titulo}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => remover(filme.movieId)}
                        aria-label={`Remover ${titulo}`}
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--borda)] bg-[var(--sala)] text-sm hover:text-[var(--feixe-claro)]"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>

              {favoritos.length === 0 && (
                <p className="suave mt-3 text-sm">
                  Busque um filme e use Adicionar para escolhê-lo.
                </p>
              )}
            </section>

            {temBase && (
              <>
                <section>
                  <label
                    htmlFor="novidade"
                    className="mb-2 block text-sm font-medium"
                  >
                    Quanto de novidade você quer?
                  </label>
                  <input
                    id="novidade"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={surpresa}
                    onChange={(e) => setSurpresa(Number(e.target.value))}
                  />
                  <div className="suave mt-1 flex justify-between text-xs">
                    <span>Parecidos</span>
                    <span>Surpresas</span>
                  </div>
                </section>

                <FilterPanel
                  filtros={filtros}
                  generos={generos}
                  onChange={setFiltros}
                />
              </>
            )}
          </div>
        </aside>

        <section
          id="recomendados"
          aria-labelledby="titulo-resultados"
          className="min-w-0 scroll-mt-6"
        >
          {!temBase ? (
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--borda)] p-6 text-center sm:aspect-[21/9]">
              <h2 id="titulo-resultados" className="text-2xl font-semibold">
                Escolha um filme que você ama
              </h2>
              <p className="suave max-w-sm text-sm">
                Use a busca para começar. Quanto mais filmes você escolher,
                melhores as sugestões.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 id="titulo-resultados" className="text-2xl font-semibold">
                  Sua próxima sessão
                </h2>
                <p className="suave text-sm">
                  {baseAvaliacoes ? (
                    <>
                      Baseado nas suas avaliações ({baseAvaliacoes.length}{" "}
                      {baseAvaliacoes.length === 1 ? "filme" : "filmes"} com 4★
                      ou mais).{" "}
                      <button
                        type="button"
                        onClick={() => setBaseAvaliacoes(null)}
                        className="text-[var(--feixe-claro)] underline underline-offset-4"
                      >
                        Usar só meus favoritos
                      </button>
                    </>
                  ) : (
                    "Baseado nos seus filmes favoritos."
                  )}
                </p>
              </div>

              {estado === "erro" && (
                <div
                  role="alert"
                  className="rounded-xl border border-[var(--borda)] bg-[var(--poltrona)] p-5"
                >
                  <p className="font-semibold">
                    Não consegui buscar as recomendações.
                  </p>
                  <p className="suave mt-1 text-sm">
                    Se a API estava parada, ela leva até 1 minuto para acordar.
                    Tente de novo em instantes.
                  </p>
                  <button
                    type="button"
                    className="botao mt-4"
                    onClick={() => setTentativa((t) => t + 1)}
                  >
                    Tentar de novo
                  </button>
                </div>
              )}

              {estado === "carregando" && (
                <div className="space-y-8">
                  <FeaturedSkeleton />
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <MovieCardSkeleton key={i} />
                    ))}
                  </ul>
                </div>
              )}

              {estado === "ok" && recomendacoes.length === 0 && (
                <div className="rounded-xl border border-dashed border-[var(--borda)] p-6 text-center">
                  <p className="font-semibold">Nenhum filme com esses filtros.</p>
                  <p className="suave mt-1 text-sm">
                    Afrouxe algum filtro ou limpe todos para ver sugestões.
                  </p>
                  <button
                    type="button"
                    className="botao mt-4"
                    onClick={() => setFiltros(FILTROS_VAZIOS)}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}

              {estado === "ok" && destaque && (
                <div className="space-y-10">
                  <FeaturedCard filme={destaque} />

                  {demais.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Mais opções</h3>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                        {demais.map((filme) => (
                          <MovieCard key={filme.movieId} filme={filme} />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <div
        id="listas"
        className="mx-auto flex max-w-7xl scroll-mt-6 flex-col gap-10 px-4 pb-16 lg:px-8"
      >
        <PerfilGosto
          onRecomendar={recomendarPorAvaliacoes}
          ativo={baseAvaliacoes !== null}
        />
        <MinhasListas />
      </div>

      <footer className="suave mx-auto max-w-7xl space-y-1 border-t border-[var(--borda)] px-4 py-8 text-xs lg:px-8">
        <p>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
        <p>
          Avaliações de usuários: MovieLens (GroupLens, Universidade de
          Minnesota).
        </p>
      </footer>
    </>
  );
}