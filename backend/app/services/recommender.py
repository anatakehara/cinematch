import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.sparse import load_npz

import re
import unicodedata

ARTIFACTS = Path(__file__).resolve().parent.parent / "artifacts"
POSTER_BASE = "https://image.tmdb.org/t/p/w500"


def _conjunto(texto, limite=None):
    """'A|B|C' -> {'A', 'B', 'C'} (ignorando vazios)."""
    itens = [i for i in texto.split("|") if i and i != "(no genres listed)"]
    return set(itens[:limite] if limite else itens)

def _normalizar(texto):
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", texto.lower()).split()
  
class Recommender:
    def __init__(self, artifacts_dir=ARTIFACTS):
        d = Path(artifacts_dir)
        self.content = load_npz(d / "content.npz").tocsr()
        self.collab = load_npz(d / "collab.npz").tocsr()
        self.movie_ids = np.load(d / "movie_ids.npy")
        self.n_aval = np.load(d / "n_aval.npy")

        config = json.loads((d / "config.json").read_text(encoding="utf-8"))
        self.alpha = config["alpha"]
        self.min_aval = config["min_avaliacoes"]

        self.movies = pd.read_csv(d / "movies.csv")
        for col in ["title", "genres", "release_date", "poster_path", "director", "cast"]:
            self.movies[col] = self.movies[col].fillna("")
        assert (self.movies["movieId"].values == self.movie_ids).all()

        self.pos = pd.Series(np.arange(len(self.movie_ids)), index=self.movie_ids)
        self._generos = [_conjunto(g) for g in self.movies["genres"]]
        self._diretores = [_conjunto(x) for x in self.movies["director"]]
        self._elencos = [_conjunto(x, 3) for x in self.movies["cast"]]
        self._tokens_titulo = [_normalizar(t) for t in self.movies["title"]]

    def search(self, trecho, n=8):
        termos = _normalizar(trecho)
        if not termos:
            return []
        achados = [
            i for i, tokens in enumerate(self._tokens_titulo)
            if all(any(t.startswith(q) for t in tokens) for q in termos)
        ]
        achados.sort(key=lambda i: -self.n_aval[i])
        return [self._ficha(i) for i in achados[:n]]

    def find_id(self, trecho):
        achados = self.search(trecho, n=1)
        return achados[0]["movieId"] if achados else None

    def title(self, movie_id):
        return self.movies.iloc[int(self.pos[movie_id])]["title"]

    def recommend(self, liked_ids, n=10, alpha=None, min_avaliacoes=None):
        alpha = self.alpha if alpha is None else alpha
        min_aval = self.min_aval if min_avaliacoes is None else min_avaliacoes

        idx = list(dict.fromkeys(
            int(self.pos[m]) for m in liked_ids if m in self.pos.index
        ))
        if not idx:
            raise ValueError("Nenhum dos filmes informados existe no catálogo.")

        perfil_ct = np.asarray(self.content[idx].sum(axis=0)).ravel()
        perfil_cf = np.asarray(self.collab[idx].sum(axis=0)).ravel()

        z_ct, sd_ct = self._z(self.content @ perfil_ct)
        z_cf, sd_cf = self._z(self.collab @ perfil_cf)
        score = alpha * z_ct + (1 - alpha) * z_cf

        score[idx] = -np.inf
        score[self.n_aval < min_aval] = -np.inf

        n = max(1, min(n, int(np.isfinite(score).sum())))
        top = np.argpartition(-score, n - 1)[:n]
        top = top[np.argsort(-score[top])]

        sim_ct = (self.content[idx] @ self.content[top].T).toarray()
        sim_cf = (self.collab[idx] @ self.collab[top].T).toarray()
        parte_ct = alpha * sim_ct / sd_ct
        parte_cf = (1 - alpha) * sim_cf / sd_cf
        contrib = parte_ct + parte_cf

        resultado = []
        for k, j in enumerate(top):
            texto, origens = self._explicar(
                int(j), idx, contrib[:, k], parte_ct[:, k], parte_cf[:, k]
            )
            ficha = self._ficha(int(j))
            ficha["score"] = round(float(score[j]), 3)
            ficha["explanation"] = texto
            ficha["because"] = origens
            resultado.append(ficha)
        return resultado

    @staticmethod
    def _z(s):
        sd = max(float(s.std()), 1e-9)
        return (s - s.mean()) / sd, sd

    def _ficha(self, i):
        m = self.movies.iloc[i]
        poster = m["poster_path"]
        return {
            "movieId": int(m["movieId"]),
            "title": m["title"],
            "year": str(m["release_date"])[:4] or None,
            "genres": sorted(self._generos[i]),
            "poster_url": f"{POSTER_BASE}{poster}" if poster else None,
        }

    def _explicar(self, j, idx, col, ct, cf):
        ordem = np.argsort(-col)
        melhor = ordem[0]
        if col[melhor] <= 0:
            return "Combina com o conjunto dos seus filmes favoritos.", []

        origens = [melhor]
        if len(ordem) > 1 and col[ordem[1]] >= 0.6 * col[melhor]:
            origens.append(ordem[1])
        titulos = [self.movies.iloc[idx[o]]["title"] for o in origens]

        texto = "Porque você gostou de " + " e ".join(titulos) + "."

        for o, titulo in zip(origens, titulos):
            base = idx[o]
            partes = []
            diretor = self._diretores[j] & self._diretores[base]
            elenco = self._elencos[j] & self._elencos[base]
            generos = self._generos[j] & self._generos[base]
            if diretor:
                partes.append("mesmo diretor (" + ", ".join(sorted(diretor)) + ")")
            if elenco:
                partes.append("elenco em comum (" + ", ".join(sorted(elenco)[:2]) + ")")
            if generos:
                partes.append("gêneros em comum (" + ", ".join(sorted(generos)[:3]) + ")")
            if partes:
                texto += f" Em comum com {titulo}: " + "; ".join(partes) + "."

        if cf[melhor] >= ct[melhor]:
            esse = "esse filme" if len(titulos) == 1 else "esses filmes"
            texto += f" Quem curte {esse} costuma gostar deste também."
        return texto, titulos