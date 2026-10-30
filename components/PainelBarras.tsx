import { formatarNumeroExato } from "@/lib/contratos-base";

const LARANJA = "#FF5B00";
const AZUL = "#2A4BA0";

export type LinhaPainel = { rotulo: string; contratos: number; receita: number };

// Painel do slide: rotulo, contagem, barra proporcional, valor e participacao.
// A barra e normalizada pela maior linha, nao pelo total — com sete motivos a
// maior fatia raramente passa de 50% e as barras ficariam todas curtas.
export function PainelBarras({
  numero,
  titulo,
  nota,
  linhas,
  rotuloTotal,
  totalContratos,
  totalReceita,
}: {
  numero: string;
  titulo: string;
  nota: string;
  linhas: LinhaPainel[];
  rotuloTotal: string;
  totalContratos: number;
  totalReceita: number;
}) {
  const maior = Math.max(...linhas.map((l) => l.receita), 1);

  return (
    <section className="flex min-w-0 flex-1 flex-col rounded border border-pwr-dark-blue/15 bg-white">
      <header
        className="flex shrink-0 items-center justify-between gap-2 rounded-t bg-pwr-dark-blue"
        style={{ padding: "0.7cqw 1cqw" }}
      >
        <span className="truncate font-semibold text-white" style={{ fontSize: "0.95cqw" }}>
          <span className="text-pwr-orange">{numero}</span> {titulo}
        </span>
        <span
          className="shrink-0 tracking-wide text-white/50 uppercase"
          style={{ fontSize: "0.72cqw" }}
        >
          {nota}
        </span>
      </header>

      {/* justify-evenly: as linhas ocupam a altura do painel em vez de ficarem
          amontoadas no topo, e paineis com menos motivos respiram mais. */}
      <div
        className="flex min-h-0 flex-1 flex-col justify-evenly"
        style={{ padding: "0.6cqw 1cqw" }}
      >
        {linhas.map((l, i) => {
          const destaque = i === 0;
          const pct = totalReceita > 0 ? (l.receita / totalReceita) * 100 : 0;
          return (
            <div key={l.rotulo} className="flex items-center" style={{ gap: "0.55cqw" }}>
              {/* Duas linhas em vez de corte: "Condições Financeiras do
                  Cliente" nao cabe numa linha e truncado perde o sentido. */}
              <span
                className={`line-clamp-2 ${destaque ? "font-semibold text-pwr-orange" : "text-pwr-blue/75"}`}
                style={{ width: "32%", fontSize: "0.92cqw", lineHeight: 1.15 }}
                title={l.rotulo}
              >
                {l.rotulo}
              </span>

              <span
                className="shrink-0 text-center font-semibold tabular-nums"
                style={{
                  width: "2.1cqw",
                  fontSize: "0.78cqw",
                  padding: "0.12cqw 0",
                  borderRadius: "0.2cqw",
                  backgroundColor: destaque ? LARANJA : "rgba(42,75,160,0.10)",
                  color: destaque ? "#fff" : AZUL,
                }}
              >
                {l.contratos}
              </span>

              <span
                className="min-w-0 flex-1 overflow-hidden"
                style={{ height: "0.85cqw", borderRadius: "0.15cqw", background: "rgba(5,36,79,0.06)" }}
              >
                <span
                  className="block h-full"
                  style={{
                    width: `${Math.max((l.receita / maior) * 100, 1.5)}%`,
                    borderRadius: "0.15cqw",
                    backgroundColor: destaque ? LARANJA : AZUL,
                  }}
                />
              </span>

              <span
                className="shrink-0 text-right font-semibold text-pwr-dark-blue tabular-nums"
                style={{ width: "7.5cqw", fontSize: "0.9cqw" }}
              >
                {formatarNumeroExato(l.receita)}
              </span>
              <span
                className="shrink-0 text-right text-pwr-blue/45 tabular-nums"
                style={{ width: "3cqw", fontSize: "0.75cqw" }}
              >
                {pct.toFixed(1).replace(".", ",")}%
              </span>
            </div>
          );
        })}
      </div>

      <footer
        className="flex shrink-0 items-center"
        style={{
          padding: "0.6cqw 1cqw 0.8cqw",
          margin: "0 1cqw",
          borderTop: "0.12cqw solid rgba(5,36,79,0.18)",
          gap: "0.55cqw",
        }}
      >
        <span
          className="truncate font-semibold tracking-wide text-pwr-dark-blue uppercase"
          style={{ width: "32%", fontSize: "0.78cqw" }}
        >
          {rotuloTotal}
        </span>
        <span
          className="shrink-0 text-center font-semibold text-pwr-dark-blue tabular-nums"
          style={{ width: "2.1cqw", fontSize: "0.85cqw" }}
        >
          {totalContratos}
        </span>
        <span className="min-w-0 flex-1" />
        <span
          className="shrink-0 text-right font-semibold text-pwr-dark-blue tabular-nums"
          style={{ width: "10.5cqw", fontSize: "0.92cqw" }}
        >
          R$ {formatarNumeroExato(totalReceita)}
        </span>
      </footer>
    </section>
  );
}
