const PT: Record<string, string> = {
  Action: "Ação",
  Adventure: "Aventura",
  Animation: "Animação",
  Children: "Infantil",
  Comedy: "Comédia",
  Crime: "Crime",
  Documentary: "Documentário",
  Drama: "Drama",
  Fantasy: "Fantasia",
  "Film-Noir": "Film noir",
  Horror: "Terror",
  IMAX: "IMAX",
  Musical: "Musical",
  Mystery: "Mistério",
  Romance: "Romance",
  "Sci-Fi": "Ficção científica",
  Thriller: "Suspense",
  War: "Guerra",
  Western: "Faroeste",
};

export const generoPt = (g: string) => PT[g] ?? g;