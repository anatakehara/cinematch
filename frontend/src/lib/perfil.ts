import { generoPt } from "@/lib/generos";
import type { FilmeVisto } from "@/lib/listas";

export const LIMITE_CURTIDO = 4;

export type Barra = { rotulo: string; curtidos: number; notaMedia: number };

type Acumulador = { curtidos: number; total: number; soma: number };

function agrupar(
  vistos: FilmeVisto[],
  chaves: (filme: FilmeVisto) => string[],
): Barra[] {
  const mapa = new Map<string, Acumulador>();

  for (const filme of vistos) {
    for (const chave of chaves(filme)) {
      const acc = mapa.get(chave) ?? { curtidos: 0, total: 0, soma: 0 };
      acc.total += 1;
      acc.soma += filme.nota;
      if (filme.nota >= LIMITE_CURTIDO) acc.curtidos += 1;
      mapa.set(chave, acc);
    }
  }

  return [...mapa.entries()]
    .filter(([, a]) => a.curtidos > 0)
    .map(([rotulo, a]) => ({
      rotulo,
      curtidos: a.curtidos,
      notaMedia: a.soma / a.total,
    }))
    .sort((x, y) => y.curtidos - x.curtidos || y.notaMedia - x.notaMedia)
    .slice(0, 6);
}

export function perfilGeneros(vistos: FilmeVisto[]): Barra[] {
  return agrupar(vistos, (f) => f.genres).map((b) => ({
    ...b,
    rotulo: generoPt(b.rotulo),
  }));
}

export function perfilDecadas(vistos: FilmeVisto[]): Barra[] {
  return agrupar(vistos, (f) => {
    const ano = Number(f.year);
    return ano > 0 ? [`Anos ${Math.floor(ano / 10) * 10}`] : [];
  });
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