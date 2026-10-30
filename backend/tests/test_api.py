import pytest


def id_do(client, nome):
    return client.get("/search", params={"q": nome}).json()[0]["movieId"]


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    assert r.json()["filmes"] > 9000


def test_busca(client):
    r = client.get("/search", params={"q": "inception"})
    assert r.status_code == 200
    filmes = r.json()
    assert filmes
    assert "Inception" in filmes[0]["title"]
    assert {"movieId", "title", "year", "genres", "poster_url", "nota", "duracao"} <= set(filmes[0])


def test_busca_curta_demais_e_rejeitada(client):
    assert client.get("/search", params={"q": "a"}).status_code == 422


def test_generos(client):
    r = client.get("/genres")
    assert r.status_code == 200
    assert "Comedy" in r.json()


def test_filmes_similares(client):
    mid = id_do(client, "inception")
    r = client.get(f"/movies/{mid}/similar")
    assert r.status_code == 200
    corpo = r.json()
    assert len(corpo) == 10
    assert all(x["movieId"] != mid for x in corpo)


def test_filmes_similares_de_filme_inexistente(client):
    assert client.get("/movies/999999999/similar").status_code == 404


def test_recomendar(client):
    ids = [id_do(client, n) for n in ("dark knight, the", "inception", "interstellar")]
    r = client.post("/recommend", json={"liked_ids": ids, "n": 5})
    assert r.status_code == 200
    corpo = r.json()
    assert len(corpo) == 5
    assert all(x["explanation"] for x in corpo)
    assert not {x["movieId"] for x in corpo} & set(ids)


def test_recomendar_com_filtro_de_decada(client):
    ids = [id_do(client, n) for n in ("dark knight, the", "inception")]
    r = client.post("/recommend", json={"liked_ids": ids, "n": 5, "decada": 1990})
    assert r.status_code == 200
    assert all(1990 <= int(x["year"]) <= 1999 for x in r.json())


def test_recomendar_com_excluir_ids(client):
    ids = [id_do(client, "inception")]
    base = client.post("/recommend", json={"liked_ids": ids, "n": 5}).json()
    fora = base[0]["movieId"]
    r = client.post(
        "/recommend", json={"liked_ids": ids, "n": 5, "excluir_ids": [fora]}
    )
    assert fora not in [x["movieId"] for x in r.json()]


def test_filtro_impossivel_devolve_lista_vazia_e_nao_erro(client):
    ids = [id_do(client, "inception")]
    r = client.post(
        "/recommend",
        json={
            "liked_ids": ids,
            "decada": 1950,
            "generos": ["Animation"],
            "nota_min": 9,
        },
    )
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.parametrize(
    "corpo",
    [
        {"liked_ids": []},
        {"liked_ids": [999999999]},
        {"liked_ids": [1], "alpha": 1.5},
        {"liked_ids": [1], "n": 0},
        {"liked_ids": [1], "nota_min": 11},
    ],
)
def test_pedidos_invalidos_devolvem_422(client, corpo):
    assert client.post("/recommend", json=corpo).status_code == 422


def test_cors_libera_o_front_local(client):
    r = client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert r.headers["access-control-allow-origin"] == "http://localhost:3000"