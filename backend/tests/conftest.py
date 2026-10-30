import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.recommender import Recommender


@pytest.fixture(scope="session")
def rec():
    return Recommender()


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def nolan(rec):
    ids = [rec.find_id(t) for t in ("Dark Knight, The", "Inception", "Interstellar")]
    assert None not in ids, "não achei um dos filmes de teste no catálogo"
    assert rec.title(ids[0]).startswith("Dark Knight, The")
    return ids