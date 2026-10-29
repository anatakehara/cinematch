import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pandas as pd
import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
ML = DATA / "ml-latest-small"
CACHE = DATA / "tmdb_cache.jsonl"
SAIDA = DATA / "movies_enriched.csv"

load_dotenv(ROOT / ".env")
API_KEY = os.getenv("TMDB_API_KEY")
URL = "https://api.themoviedb.org/3/movie/{}"


def buscar_filme(tmdb_id, tentativas=3):
    """Busca um filme no TMDB. Retorna (status, dados)."""
    for i in range(tentativas):
        try:
            r = requests.get(
                URL.format(tmdb_id),
                params={
                    "api_key": API_KEY,
                    "language": "en-US",
                    "append_to_response": "credits,keywords",
                },
                timeout=20,
            )
            if r.status_code == 200:
                return "ok", r.json()
            if r.status_code == 404:
                return "nao_encontrado", None
            if r.status_code == 429:  # muitas requisições: espera e tenta de novo
                time.sleep(int(r.headers.get("Retry-After", 2)))
        except requests.RequestException:
            time.sleep(1 + i)
    return "erro", None


def extrair(d):
    credits = d.get("credits") or {}
    crew = credits.get("crew") or []
    cast = credits.get("cast") or []
    kws = (d.get("keywords") or {}).get("keywords") or []
    return {
        "tmdbId": d.get("id"),
        "overview": d.get("overview") or "",
        "tagline": d.get("tagline") or "",
        "release_date": d.get("release_date") or "",
        "runtime": d.get("runtime"),
        "original_language": d.get("original_language"),
        "vote_average": d.get("vote_average"),
        "vote_count": d.get("vote_count"),
        "poster_path": d.get("poster_path"),
        "backdrop_path": d.get("backdrop_path"),
        "director": "|".join(p["name"] for p in crew if p.get("job") == "Director"),
        "cast": "|".join(p["name"] for p in cast[:5]),
        "keywords": "|".join(k["name"] for k in kws),
    }


def montar_csv():
    registros = []
    with open(CACHE, encoding="utf-8") as f:
        for linha in f:
            registros.append(json.loads(linha))
    tmdb = pd.DataFrame(registros).drop(columns=["nao_encontrado"], errors="ignore")

    movies = pd.read_csv(ML / "movies.csv")
    final = movies.merge(tmdb, on="movieId", how="left")
    final.to_csv(SAIDA, index=False)
    print(f"Arquivo salvo: {SAIDA} ({len(final)} filmes)")


def main():
    if not API_KEY:
        sys.exit("Chave não encontrada. Confira o arquivo .env na raiz do projeto.")

    teste = requests.get(URL.format(862), params={"api_key": API_KEY}, timeout=20)
    if teste.status_code == 401:
        sys.exit("A chave da API é inválida. Confira o valor no arquivo .env.")

    limite = int(sys.argv[1]) if len(sys.argv) > 1 else None

    links = pd.read_csv(ML / "links.csv").dropna(subset=["tmdbId"])
    links["tmdbId"] = links["tmdbId"].astype(int)
    if limite:
        links = links.head(limite)

    feitos = set()
    if CACHE.exists():
        with open(CACHE, encoding="utf-8") as f:
            for linha in f:
                feitos.add(json.loads(linha)["movieId"])

    pendentes = links[~links["movieId"].isin(feitos)]
    print(f"{len(pendentes)} filmes para buscar ({len(feitos)} já no cache).")

    if len(pendentes) > 0:
        with open(CACHE, "a", encoding="utf-8") as saida, ThreadPoolExecutor(
            max_workers=8
        ) as ex:
            futuros = {
                ex.submit(buscar_filme, int(row.tmdbId)): int(row.movieId)
                for row in pendentes.itertuples()
            }
            for i, fut in enumerate(as_completed(futuros), 1):
                movie_id = futuros[fut]
                status, dados = fut.result()
                if status == "erro":
                    continue
                registro = {"movieId": movie_id}
                registro.update(extrair(dados) if dados else {"nao_encontrado": True})
                saida.write(json.dumps(registro, ensure_ascii=False) + "\n")
                saida.flush()
                if i % 100 == 0:
                    print(f"  {i}/{len(pendentes)}")

    montar_csv()


if __name__ == "__main__":
    main()