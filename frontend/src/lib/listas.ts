import { useSyncExternalStore } from "react";
import type { Filme } from "@/lib/api";

export type FilmeVisto = Filme & { nota: number };
export type Listas = {
  quero: Filme[];
  vistos: FilmeVisto[];
  favoritos: Filme[];
};

const CHAVE = "cinematch:listas:v1";
const VAZIO: Listas = { quero: [], vistos: [], favoritos: [] };

let cache: Listas | null = null;
const ouvintes = new Set<() => void>();

function lerDoNavegador(): Listas {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const dados = JSON.parse(bruto);
      if (Array.isArray(dados.quero) && Array.isArray(dados.vistos)) {
        return {
          quero: dados.quero,
          vistos: dados.vistos,
          favoritos: Array.isArray(dados.favoritos) ? dados.favoritos : [],
        };
      }
    }
  } catch {
  }
  return VAZIO;
}

function snapshotCliente(): Listas {
  if (cache === null) cache = lerDoNavegador();
  return cache;
}

const snapshotServidor = () => VAZIO;

function assinar(aviso: () => void) {
  ouvintes.add(aviso);
  const aoMudarEmOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE || e.key === null) {
      cache = null;
      aviso();
    }
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(aviso);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

function salvar(novo: Listas) {
  cache = novo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
  }
  ouvintes.forEach((aviso) => aviso());
}

function resumo(f: Filme): Filme {
  return {
    movieId: f.movieId,
    title: f.title,
    year: f.year,
    genres: f.genres,
    poster_url: f.poster_url,
  };
}

export function adicionarFavorito(filme: Filme, limite: number) {
  const atual = snapshotCliente();
  const jaTem = atual.favoritos.some((f) => f.movieId === filme.movieId);
  if (jaTem || atual.favoritos.length >= limite) return;
  salvar({ ...atual, favoritos: [...atual.favoritos, resumo(filme)] });
}

export function removerFavorito(id: number) {
  const atual = snapshotCliente();
  salvar({
    ...atual,
    favoritos: atual.favoritos.filter((f) => f.movieId !== id),
  });
}

export function alternarQuero(filme: Filme) {
  const atual = snapshotCliente();
  const jaTem = atual.quero.some((f) => f.movieId === filme.movieId);
  salvar({
    ...atual,
    quero: jaTem
      ? atual.quero.filter((f) => f.movieId !== filme.movieId)
      : [resumo(filme), ...atual.quero],
  });
}

export function avaliar(filme: Filme, nota: number) {
  const atual = snapshotCliente();
  const outros = atual.vistos.filter((f) => f.movieId !== filme.movieId);
  salvar({
    ...atual,
    quero: atual.quero.filter((f) => f.movieId !== filme.movieId),
    vistos: [{ ...resumo(filme), nota }, ...outros],
  });
}

export function removerQuero(id: number) {
  const atual = snapshotCliente();
  salvar({ ...atual, quero: atual.quero.filter((f) => f.movieId !== id) });
}

export function removerVisto(id: number) {
  const atual = snapshotCliente();
  salvar({ ...atual, vistos: atual.vistos.filter((f) => f.movieId !== id) });
}

export function idsVistos(): number[] {
  return snapshotCliente().vistos.map((f) => f.movieId);
}

export function useListas() {
  const listas = useSyncExternalStore(assinar, snapshotCliente, snapshotServidor);
  return {
    ...listas,
    noQuero: (id: number) => listas.quero.some((f) => f.movieId === id),
    notaDe: (id: number) => listas.vistos.find((f) => f.movieId === id)?.nota ?? 0,
  };
}