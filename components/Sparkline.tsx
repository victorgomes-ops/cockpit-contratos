const INICIAIS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Doze colunas, uma por mes do ano. Serve de contexto para o numero grande do
// KPI: mostra se o mes selecionado e um pico, um vale ou a rotina.
export function Sparkline({
  valores,
  destaque,
  ano,
}: {
  valores: number[];
  /** Indice 0-11 do mes em foco, ou null quando o filtro e o ano inteiro. */
  destaque: number | null;
  ano: string;
}) {
  const maior = Math.max(...valores, 1);

  return (
    <div className="mt-1.5 flex h-6 items-end gap-[2px]" aria-hidden="true">
      {valores.map((v, i) => {
        const emFoco = destaque === i;
        return (
          <span
            key={i}
            title={`${INICIAIS[i]} ${ano}: ${v}`}
            className="flex-1 rounded-t-[2px] transition-colors"
            style={{
              height: `${Math.max((v / maior) * 100, 6)}%`,
              backgroundColor: emFoco ? "#FF5B00" : "rgba(5, 36, 79, 0.16)",
            }}
          />
        );
      })}
    </div>
  );
}
