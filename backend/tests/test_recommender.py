import pytest


# ---------- busca ----------
def test_busca_ignora_a_ordem_das_palavras(rec):
    a = [f["movieId"] for f in rec.search("knight dark", n=20)]
    b = [f["movieId"] for f in rec.search("dark knight", n=20)]
    assert a and a == b


def test_busca_ignora_acentos(rec):
    com = [f["movieId"] for f in rec.search("amélie")]
    sem = [f["movieId"] for f in rec.search("amelie")]
    assert com and com == sem


def test_busca_aceita_comeco_de_palavra(rec, nolan):
    ids = [f["movieId"] for f in rec.search("dark kni", n=20)]
    assert nolan[0] in ids


def test_busca_sem_resultado(rec):
    assert rec.search("") == []
    assert rec.search("zzzzqqqq") == []


# ---------- recomendação ----------
def test_devolve_n_filmes_sem_repetir_nem_incluir_favoritos(rec, nolan):
    ids = [x["movieId"] for x in rec.recommend(nolan, n=10)]
    assert len(ids) == 10
    assert len(set(ids)) == 10
    assert not set(ids) & set(nolan)


def test_nao_recomenda_filmes_com_poucas_avaliacoes(rec, nolan):
    for x in rec.recommend(nolan, n=30):
        assert rec.n_aval[rec.pos[x["movieId"]]] >= rec.min_aval


def test_alpha_muda_o_resultado(rec, nolan):
    so_conteudo = {x["movieId"] for x in rec.recommend(nolan, n=10, alpha=1.0)}
    so_colaborativo = {x["movieId"] for x in rec.recommend(nolan, n=10, alpha=0.0)}
    assert so_conteudo != so_colaborativo


def test_excluir_remove_o_filme_da_lista(rec, nolan):
    primeiro = rec.recommend(nolan, n=5)[0]["movieId"]
    depois = [x["movieId"] for x in rec.recommend(nolan, n=5, excluir=[primeiro])]
    assert primeiro not in depois


def test_ids_inexistentes_levantam_erro(rec):
    with pytest.raises(ValueError):
        rec.recommend([999999999])


# ---------- filtros ----------
def test_filtro_de_decada(rec, nolan):
    r = rec.recommend(nolan, n=10, ano_min=1990, ano_max=1999)
    assert r
    assert all(1990 <= int(x["year"]) <= 1999 for x in r)


def test_filtro_de_genero(rec, nolan):
    r = rec.recommend(nolan, n=10, generos=["Comedy"])
    assert r
    assert all("Comedy" in x["genres"] for x in r)


def test_filtro_com_varios_generos_aceita_qualquer_um(rec, nolan):
    r = rec.recommend(nolan, n=10, generos=["Comedy", "Western"])
    assert r
    assert all({"Comedy", "Western"} & set(x["genres"]) for x in r)


def test_filtro_de_nota_minima(rec, nolan):
    r = rec.recommend(nolan, n=10, nota_min=7.5)
    assert r
    # lê um atributo interno só para conferir o resultado
    assert all(rec._notas[rec.pos[x["movieId"]]] >= 7.5 for x in r)


def test_filtros_impossiveis_devolvem_lista_vazia(rec, nolan):
    r = rec.recommend(
        nolan, n=10, ano_min=1950, ano_max=1959, generos=["Animation"], nota_min=9
    )
    assert r == []


# ---------- explicações ----------
def test_explicacoes_citam_apenas_os_favoritos_certos(rec, nolan):
    """Garante que a correção do Passo 12 não volta a quebrar."""
    favoritos = {rec.title(i) for i in nolan}
    for x in rec.recommend(nolan, n=10):
        assert x["explanation"]
        assert set(x["because"]) <= favoritos
        for nao_citado in favoritos - set(x["because"]):
            assert f"Em comum com {nao_citado}" not in x["explanation"]