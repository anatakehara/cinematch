"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import MovieDialog from "@/components/MovieDialog";
import type { Filme } from "@/lib/api";

type Contexto = { abrir: (filme: Filme) => void };

const DetalhesContext = createContext<Contexto | null>(null);

export function DetalhesProvider({ children }: { children: ReactNode }) {
  const [filme, setFilme] = useState<Filme | null>(null);
  const abrir = useCallback((f: Filme) => setFilme(f), []);
  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <DetalhesContext.Provider value={valor}>
      {children}
      {filme && (
        <MovieDialog
          key={filme.movieId}
          filme={filme}
          onClose={() => setFilme(null)}
        />
      )}
    </DetalhesContext.Provider>
  );
}

export function useAbrirDetalhes() {
  const contexto = useContext(DetalhesContext);
  if (!contexto) {
    throw new Error("useAbrirDetalhes precisa estar dentro de DetalhesProvider");
  }
  return contexto.abrir;
}