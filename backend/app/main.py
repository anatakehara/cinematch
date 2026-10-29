from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import Filme, PedidoRecomendacao, Recomendacao
from app.services.recommender import Recommender

modelo: dict[str, Recommender] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    modelo["rec"] = Recommender()
    yield
    modelo.clear()


app = FastAPI(
    title="CineMatch API",
    description="Recomendador híbrido de filmes, com explicações.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "filmes": len(modelo["rec"].movie_ids)}


@app.get("/search", response_model=list[Filme])
def search(q: str = Query(min_length=2), n: int = Query(8, ge=1, le=20)):
    return modelo["rec"].search(q, n=n)


@app.get("/movies/{movie_id}/similar", response_model=list[Recomendacao])
def similar(movie_id: int, n: int = Query(10, ge=1, le=30)):
    rec = modelo["rec"]
    if movie_id not in rec.pos.index:
        raise HTTPException(status_code=404, detail="Filme não encontrado.")
    return rec.recommend([movie_id], n=n)


@app.post("/recommend", response_model=list[Recomendacao])
def recommend(pedido: PedidoRecomendacao):
    rec = modelo["rec"]
    try:
        return rec.recommend(pedido.liked_ids, n=pedido.n, alpha=pedido.alpha)
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro))