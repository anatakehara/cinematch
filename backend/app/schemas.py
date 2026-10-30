from pydantic import BaseModel, Field

class Filme(BaseModel):
    movieId: int
    title: str
    year: str | None = None
    genres: list[str]
    poster_url: str | None = None
    nota: float | None = None
    duracao: int | None = None


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
    generos: list[str] | None = Field(None, max_length=10)
    decada: int | None = Field(None, ge=1900, le=2020, description="Ex.: 1990")
    nota_min: float | None = Field(None, ge=0, le=10)
    excluir_ids: list[int] = Field(default_factory=list, max_length=1000)
    
class FilmeDetalhe(Filme):
    overview: str = ""
    tagline: str = ""
    directors: list[str] = []
    cast: list[str] = []
    n_avaliacoes: int = 0