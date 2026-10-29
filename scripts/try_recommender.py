import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from app.services.recommender import Recommender


def mostrar(rec, titulos, n=8, **kwargs):
    ids = []
    for t in titulos:
        mid = rec.find_id(t)
        if mid is None:
            print(f"  (não achei: {t})")
        else:
            ids.append(mid)

    print("\nFavoritos:", [rec.title(i) for i in ids])
    inicio = time.perf_counter()
    resultado = rec.recommend(ids, n=n, **kwargs)
    ms = (time.perf_counter() - inicio) * 1000
    print(f"({ms:.0f} ms)\n")

    for pos, r in enumerate(resultado, 1):
        print(f"{pos}. {r['title']}  |  {', '.join(r['genres'])}")
        print(f"   {r['explanation']}\n")


if __name__ == "__main__":
    inicio = time.perf_counter()
    rec = Recommender()
    print(f"Modelo carregado em {(time.perf_counter() - inicio) * 1000:.0f} ms")

    print("\n===== Teste 1: ficção científica (Nolan) =====")
    mostrar(rec, ["Dark Knight, The", "Inception", "Interstellar"])

    print("\n===== Teste 2: animações =====")
    mostrar(rec, ["Toy Story (1995)", "Finding Nemo", "Incredibles, The"])

    print("\n===== Teste 3: só conteúdo (alpha=1) vs só colaborativo (alpha=0) =====")
    print("\n--- alpha = 1.0 (só conteúdo) ---")
    mostrar(rec, ["Dark Knight, The", "Inception", "Interstellar"], n=5, alpha=1.0)
    print("\n--- alpha = 0.0 (só colaborativo) ---")
    mostrar(rec, ["Dark Knight, The", "Inception", "Interstellar"], n=5, alpha=0.0)