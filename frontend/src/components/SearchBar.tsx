"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { buscarFilmes, type Filme } from "@/lib/api";
import { generoPt } from "@/lib/generos";
import { tituloLegivel } from "@/lib/titulo";

type Props = {
  onSelect: (filme: Filme) => void;
  idsEscolhidos: number[];
  limite: number;
};

export default function SearchBar({ onSelect, idsEscolhidos, limite }: Props) {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<Filme[]>([]);
  const [estado, setEstado] = useState<"carregando" | "ok" | "erro">("ok");
  const [aberto, setAberto] = useState(false);
  const [indice, setIndice] = useState(-1);
  const [aviso, setAviso] = useState("");

  const termo = texto.trim();
  const valido = termo.length >= 2;
  const mostrarLista = aberto && valido;
  const listaId = `${id}-lista`;
  const cheio = idsEscolhidos.length >= limite;

  useEffect(() => {
    if (!valido) return;

    const controle = new AbortController();
    const espera = setTimeout(async () => {
      setEstado("carregando");
      try {
        setResultados(await buscarFilmes(termo, controle.signal));
        setIndice(-1);
        setEstado("ok");
      } catch (erro) {
        if ((erro as Error).name !== "AbortError") setEstado("erro");
      }
    }, 300);

    return () => {
      clearTimeout(espera);
      controle.abort();
    };
  }, [termo, valido]);

  function adicionar(filme: Filme) {
    if (cheio || idsEscolhidos.includes(filme.movieId)) return;
    onSelect(filme);
    const total = idsEscolhidos.length + 1;
    setAviso(
      `${tituloLegivel(filme.title)} adicionado. ${total} de ${limite} favoritos.`,
    );
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setAberto(false);
      return;
    }
    if (!mostrarLista || estado !== "ok" || resultados.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && indice >= 0) {
      e.preventDefault();
      adicionar(resultados[indice]);
    }
  }

  return (
    <div className="relative z-30">
      <input
        type="search"
        role="combobox"
        aria-expanded={mostrarLista}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={indice >= 0 ? `${id}-op-${indice}` : undefined}
        aria-label="Buscar filme"
        autoComplete="off"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onClick={() => setAberto(true)}
        onBlur={() => setAberto(false)}
        onKeyDown={aoTeclar}
        placeholder="Buscar um filme, como Inception"
        className="campo"
      />

      <p role="status" className="sr-only">
        {aviso}
      </p>

      {mostrarLista && (
        <ul
          id={listaId}
          role="listbox"
          aria-label="Resultados da busca"
          className="absolute mt-2 max-h-[60vh] w-full overflow-y-auto rounded-xl border border-[var(--borda)] bg-[var(--poltrona)]"
        >
          {cheio && (
            <li
              role="presentation"
              className="border-b border-[var(--borda)] px-4 py-3 text-sm"
            >
              Você já escolheu {limite} filmes. Remova um nos favoritos para
              adicionar outro.
            </li>
          )}

          {estado === "carregando" && (
            <li role="presentation" className="suave px-4 py-3 text-sm">
              Buscando...
            </li>
          )}

          {estado === "erro" && (
            <li role="presentation" className="px-4 py-3 text-sm">
              Não consegui buscar. Se a API estava parada, ela leva até 1 minuto
              para acordar. Tente de novo.
            </li>
          )}

          {estado === "ok" && resultados.length === 0 && (
            <li role="presentation" className="suave px-4 py-3 text-sm">
              Nenhum filme encontrado.
            </li>
          )}

          {estado === "ok" &&
            resultados.map((filme, i) => {
              const adicionado = idsEscolhidos.includes(filme.movieId);
              const bloqueado = cheio && !adicionado;
              return (
                <li
                  key={filme.movieId}
                  id={`${id}-op-${i}`}
                  role="option"
                  aria-selected={i === indice}
                  aria-disabled={adicionado || bloqueado}
                  // preventDefault mantém o foco no campo, e a lista continua aberta
                  onMouseDown={(e) => {
                    e.preventDefault();
                    adicionar(filme);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 ${
                    bloqueado ? "opacity-40" : adicionado ? "" : "cursor-pointer"
                  } ${
                    i === indice
                      ? "bg-[var(--borda)]"
                      : adicionado || bloqueado
                        ? ""
                        : "hover:bg-[var(--borda)]"
                  }`}
                >
                  {filme.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={filme.poster_url}
                      alt=""
                      className="h-14 w-10 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-14 w-10 shrink-0 rounded bg-[var(--borda)]" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {tituloLegivel(filme.title)}
                    </p>
                    <p className="suave truncate text-xs">
                      {filme.year && (
                        <span className="mr-2 tabular-nums">{filme.year}</span>
                      )}
                      {filme.genres.slice(0, 2).map(generoPt).join(", ")}
                    </p>
                  </div>

                  {adicionado ? (
                    <span className="shrink-0 text-xs font-semibold text-[var(--feixe-claro)]">
                      ✓ Adicionado
                    </span>
                  ) : !bloqueado ? (
                    <span className="chip shrink-0">Adicionar</span>
                  ) : null}
                </li>
              );
            })}

          {estado === "ok" && resultados.length > 0 && (
            <li
              role="presentation"
              className="suave sticky bottom-0 border-t border-[var(--borda)] bg-[var(--poltrona)] px-4 py-2 text-xs"
            >
              {idsEscolhidos.length} de {limite} favoritos · Esc para fechar
            </li>
          )}
        </ul>
      )}
    </div>
  );
}