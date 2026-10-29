"use client";

import { useEffect, useState } from "react";
import { buscarFilmes, type Filme } from "@/lib/api";

type Props = { onSelect: (filme: Filme) => void };

export default function SearchBar({ onSelect }: Props) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Filme[]>([]);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("ok");
  const [aberto, setAberto] = useState(false);

  const termo = texto.trim();
  const ativo = termo.length >= 2;

  useEffect(() => {
    if (!ativo) return;

    const controle = new AbortController();
    const espera = setTimeout(async () => {
      setEstado("carregando");
      try {
        setResultados(await buscarFilmes(termo, controle.signal));
        setEstado("ok");
      } catch (erro) {
        if ((erro as Error).name !== "AbortError") setEstado("erro");
      }
    }, 300);

    return () => {
      clearTimeout(espera);
      controle.abort();
    };
  }, [termo, ativo]);

  function escolher(filme: Filme) {
    onSelect(filme);
    setTexto("");
    setAberto(false);
  }

  return (
    <div className="relative w-full max-w-xl">
      <input
        type="search"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        onKeyDown={(e) => e.key === "Escape" && setAberto(false)}
        placeholder="Busque um filme (ex.: Inception)"
        aria-label="Buscar filme"
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />

      {aberto && ativo && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {estado === "carregando" && (
            <li className="px-4 py-3 text-sm text-neutral-500">Buscando...</li>
          )}

          {estado === "erro" && (
            <li className="px-4 py-3 text-sm text-red-600">
              Não consegui buscar. A API está rodando?
            </li>
          )}

          {estado === "ok" && resultados.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-500">
              Nenhum filme encontrado.
            </li>
          )}

          {estado === "ok" &&
            resultados.map((filme) => (
              <li key={filme.movieId}>
                <button
                  type="button"
                  onMouseDown={() => escolher(filme)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-neutral-800"
                >
                  {filme.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filme.poster_url}
                      alt=""
                      className="h-14 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-14 w-10 rounded bg-neutral-200 dark:bg-neutral-700" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {filme.title}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {filme.genres.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}