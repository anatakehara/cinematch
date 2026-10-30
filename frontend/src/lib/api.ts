export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type Filme = {
  movieId: number;
  title: string;
  year: string | null;
  genres: string[];
  poster_url: string | null;
};

export async function buscarFilmes(
  q: string,
  signal?: AbortSignal,
): Promise<Filme[]> {
  const resposta = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(q)}&n=8`,
    { signal },
  );
  if (!resposta.ok) throw new Error("Falha na busca");
  return resposta.json();
}

export type Recomendacao = Filme & {
  score: number;
  explanation: string;
  because: string[];
};

export type Filtros = {
  generos: string[];
  decada: number | null;
  notaMin: number;
};

export const FILTROS_VAZIOS: Filtros = { generos: [], decada: null, notaMin: 0 };

export async function recomendar(
  ids: number[],
  alpha: number,
  filtros: Filtros,
  excluir: number[],
  signal?: AbortSignal,
): Promise<Recomendacao[]> {
  const resposta = await fetch(`${API_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      liked_ids: ids,
      n: 12,
      alpha,
      generos: filtros.generos.length ? filtros.generos : null,
      decada: filtros.decada,
      nota_min: filtros.notaMin > 0 ? filtros.notaMin : null,
      excluir_ids: excluir,
    }),
    signal,
  });
  if (!resposta.ok) throw new Error("Falha ao recomendar");
  return resposta.json();
}

export async function buscarGeneros(): Promise<string[]> {
  const resposta = await fetch(`${API_URL}/genres`);
  if (!resposta.ok) throw new Error("Falha ao buscar gêneros");
  return resposta.json();
}