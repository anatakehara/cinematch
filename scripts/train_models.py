import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix, hstack, save_npz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import normalize

ROOT = Path(__file__).resolve().parent.parent
ML = ROOT / "data" / "ml-latest-small"
ENRIQUECIDO = ROOT / "data" / "movies_enriched.csv"
OUT = ROOT / "backend" / "app" / "artifacts"


ALPHA = 0.4
MIN_AVALIACOES = 20

COLUNAS_FILME = [
    "movieId", "title", "genres", "overview", "tagline", "release_date",
    "runtime", "vote_average", "vote_count", "poster_path", "backdrop_path",
    "director", "cast", "keywords",
]


def limpar_token(texto):
    return re.sub(r"[^a-z0-9]", "", texto.lower())


def lista_para_tokens(valor, limite=None):
    if pd.isna(valor) or valor == "":
        return ""
    itens = valor.split("|")
    if limite:
        itens = itens[:limite]
    tokens = [limpar_token(i) for i in itens]
    return " ".join(t for t in tokens if t)


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    ratings = pd.read_csv(ML / "ratings.csv")
    filmes = pd.read_csv(ENRIQUECIDO)

    movie_ids = np.sort(ratings["movieId"].unique())
    user_ids = np.sort(ratings["userId"].unique())
    u_idx = pd.Series(np.arange(len(user_ids)), index=user_ids)
    m_idx = pd.Series(np.arange(len(movie_ids)), index=movie_ids)

    print("Treinando modelo colaborativo...")
    ratings["rating_c"] = ratings["rating"] - ratings.groupby("userId")["rating"].transform("mean")
    R_c = csr_matrix(
        (
            ratings["rating_c"].values,
            (u_idx[ratings["userId"]].values, m_idx[ratings["movieId"]].values),
        ),
        shape=(len(user_ids), len(movie_ids)),
    )
    colab = normalize(R_c.T.tocsr())
    n_aval = ratings.groupby("movieId")["rating"].count().reindex(movie_ids).values

    print("Treinando modelo de conteúdo...")
    f = filmes.set_index("movieId").reindex(movie_ids)

    meta = (
        f["genres"].replace("(no genres listed)", "").apply(lista_para_tokens) + " "
        + f["director"].apply(lista_para_tokens) + " "
        + f["cast"].apply(lambda v: lista_para_tokens(v, 3)) + " "
        + f["keywords"].apply(lista_para_tokens)
    )
    sinopse = (f["overview"].fillna("") + " " + f["tagline"].fillna("")).str.lower()

    m_meta = TfidfVectorizer(token_pattern=r"\S+").fit_transform(meta)
    m_sin = TfidfVectorizer(stop_words="english", min_df=2, max_features=20000).fit_transform(sinopse)
    conteudo = normalize(hstack([1.0 * m_meta, 0.6 * m_sin]).tocsr())

    print("Salvando artefatos...")
    save_npz(OUT / "content.npz", conteudo)
    save_npz(OUT / "collab.npz", colab)
    np.save(OUT / "movie_ids.npy", movie_ids)
    np.save(OUT / "n_aval.npy", n_aval)
    f.reset_index()[COLUNAS_FILME].to_csv(OUT / "movies.csv", index=False)
    (OUT / "config.json").write_text(
        json.dumps({"alpha": ALPHA, "min_avaliacoes": MIN_AVALIACOES}, indent=2),
        encoding="utf-8",
    )

    print(f"Pronto! {len(movie_ids)} filmes. Arquivos em: {OUT}")


if __name__ == "__main__":
    main()