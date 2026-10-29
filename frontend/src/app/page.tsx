"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [status, setStatus] = useState<"carregando" | "ok" | "erro">("carregando");
  const [filmes, setFilmes] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((resposta) => resposta.json())
      .then((dados) => {
        setFilmes(dados.filmes);
        setStatus("ok");
      })
      .catch(() => setStatus("erro"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">🎬 CineMatch</h1>

      {status === "carregando" && <p>Conectando à API...</p>}

      {status === "ok" && (
        <p className="text-green-600">
          API conectada! {filmes?.toLocaleString("pt-BR")} filmes no catálogo.
        </p>
      )}

      {status === "erro" && (
        <p className="text-red-600">
          Não consegui falar com a API. Ela está rodando?
        </p>
      )}
    </main>
  );
}