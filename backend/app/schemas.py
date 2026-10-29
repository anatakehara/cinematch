from pydantic import BaseModel, Field

class Filme(BaseModel):
    movieId: int
    title: str
    year: str | None = None
    genres: list[str]
    poster_url: str | None = None


class Recomendacao(Filme):
    score: float
    explanation: str
    because: list[str]


class PedidoRecomendacao(BaseModel):
    liked_ids: list[int] = Field(min_length=1, max_length=50)
    n: int = Field(10, ge=1, le=30)
    alpha: float | None = Field(
        None, ge=0, le=1,
        description="Peso do conteúdo (0 = só colaborativo, 1 = só conteúdo).",
    )