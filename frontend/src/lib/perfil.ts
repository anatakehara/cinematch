import { generoPt } from "@/lib/generos";
import type { FilmeVisto } from "@/lib/listas";

export const LIMITE_CURTIDO = 4;

export type Barra = {
  rotulo: string;
  pct: number;
  curtidos: number;
  notaMedia: number;
};

type Item = {
  rotulo: string;
  curtidos: number;
  total: number;
  soma: number;
};

function contar(
  vistos: FilmeVisto[],
  chaves: (filme: FilmeVisto) => string[],
): Item[] {
  const mapa = new Map<string, Item>();

  for (const filme of vistos) {
    for (const rotulo of chaves(filme)) {
      const item = mapa.get(rotulo) ?? { rotulo, curtidos: 0, total: 0, soma: 0 };
      item.total += 1;
      item.soma += filme.nota;
      if (filme.nota >= LIMITE_CURTIDO) item.curtidos += 1;
      mapa.set(rotulo, item);
    }
  }

  return [...mapa.values()]
    .filter((i) => i.curtidos > 0)
    .sort(
      (a, b) => b.curtidos - a.curtidos || b.soma / b.total - a.soma / a.total,
    );
}

function paraBarras(itens: Item[], maxItens: number, comOutros: boolean): Barra[] {
  const totalCurtidos = itens.reduce((s, i) => s + i.curtidos, 0);
  if (totalCurtidos === 0) return [];

  const barra = (rotulo: string, grupo: Item[]): Barra => {
    const curtidos = grupo.reduce((s, i) => s + i.curtidos, 0);
    const total = grupo.reduce((s, i) => s + i.total, 0);
    const soma = grupo.reduce((s, i) => s + i.soma, 0);
    return {
      rotulo,
      pct: Math.round((curtidos / totalCurtidos) * 100),
      curtidos,
      notaMedia: soma / total,
    };
  };

  const barras = itens.slice(0, maxItens).map((i) => barra(i.rotulo, [i]));
  const resto = itens.slice(maxItens);
  if (comOutros && resto.length > 0) barras.push(barra("Outros", resto));
  return barras;
}

export function perfilGeneros(vistos: FilmeVisto[]): Barra[] {
  return paraBarras(contar(vistos, (f) => f.genres.map(generoPt)), 6, true);
}

export function perfilDecadas(vistos: FilmeVisto[]): Barra[] {
  return paraBarras(
    contar(vistos, (f) => {
      const ano = Number(f.year);
      return ano > 0 ? [`${Math.floor(ano / 10) * 10}s`] : [];
    }),
    5,
    false,
  );
}

export function resumo(vistos: FilmeVisto[]) {
  const soma = vistos.reduce((s, f) => s + f.nota, 0);
  return {
    total: vistos.length,
    curtidos: vistos.filter((f) => f.nota >= LIMITE_CURTIDO).length,
    media: vistos.length ? soma / vistos.length : 0,
  };
}

export function idsCurtidos(vistos: FilmeVisto[]): number[] {
  return vistos
    .filter((f) => f.nota >= LIMITE_CURTIDO)
    .map((f) => f.movieId)
    .slice(0, 50);
}