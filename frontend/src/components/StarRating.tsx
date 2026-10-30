type Props = {
  nota: number;
  onChange: (nota: number) => void;
  titulo: string;
  compacto?: boolean;
};

export default function StarRating({ nota, onChange, titulo, compacto }: Props) {
  return (
    <div role="group" aria-label={`Sua nota para ${titulo}`} className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
          aria-pressed={n === nota}
          className={`leading-none transition-colors ${
            compacto ? "px-px text-sm" : "px-0.5 text-xl"
          } ${
            n <= nota
              ? "text-[var(--feixe-claro)]"
              : "text-[var(--estrela-vazia)] hover:text-[var(--feixe-claro)]"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}