import type { ReactNode } from "react";

// O slide se mede em cqw (1% da propria largura), entao tudo dentro dele
// escala junto: na tela, no print e em qualquer largura de janela a proporcao
// das fontes e do espacamento e sempre a mesma.
export function Slide({
  titulo,
  subtitulo,
  rodape,
  acao,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  rodape: string;
  /** Botao de copiar; sai na impressao. */
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      {acao && <div className="nao-imprimir mb-1.5 flex justify-end">{acao}</div>}

      <section
        className="slide relative flex w-full flex-col overflow-hidden rounded-md border border-pwr-dark-blue/15 bg-white"
        style={{ aspectRatio: "16 / 9", containerType: "inline-size" }}
      >
        <header
          className="flex shrink-0 items-center justify-between gap-4 bg-pwr-dark-blue"
          style={{ height: "10cqw", paddingLeft: "3cqw", paddingRight: "3cqw" }}
        >
          <div className="min-w-0">
            <h2
              className="truncate leading-tight font-semibold text-white"
              style={{ fontSize: "2.4cqw" }}
            >
              {titulo}
            </h2>
            {subtitulo && (
              <p
                className="truncate text-white/55"
                style={{ fontSize: "1.25cqw", marginTop: "0.4cqw" }}
              >
                {subtitulo}
              </p>
            )}
          </div>

          <span className="flex shrink-0 items-center" style={{ gap: "0.8cqw" }}>
            <span
              className="flex items-center justify-center rounded-full font-bold text-pwr-orange"
              style={{
                width: "2.6cqw",
                height: "2.6cqw",
                border: "0.18cqw solid #FF5B00",
                fontSize: "1.4cqw",
              }}
            >
              ›
            </span>
            <span className="font-semibold" style={{ fontSize: "1.7cqw" }}>
              <span className="text-white">pwr</span>{" "}
              <span className="text-white/45">GESTÃO</span>
            </span>
          </span>
        </header>

        <div className="shrink-0 bg-pwr-orange" style={{ height: "0.4cqw" }} />

        <div
          className="min-h-0 flex-1"
          style={{
            paddingLeft: "3cqw",
            paddingRight: "3cqw",
            paddingTop: "2.4cqw",
            paddingBottom: "0.6cqw",
          }}
        >
          {children}
        </div>

        <footer
          className="flex shrink-0 items-center justify-between"
          style={{
            paddingLeft: "3cqw",
            paddingRight: "3cqw",
            paddingBottom: "1.5cqw",
            paddingTop: "1cqw",
            fontSize: "1.05cqw",
          }}
        >
          <span className="truncate text-pwr-blue/40">{rodape}</span>
          <span className="shrink-0 text-pwr-blue/30">pwrgestao.com</span>
        </footer>
      </section>
    </div>
  );
}

// Tabela dimensionada em cqw, para caber e continuar legivel projetada.
export function TabelaSlide({
  colunas,
  linhas,
  total,
}: {
  colunas: { titulo: string; largura: string }[];
  linhas: string[][];
  total: string[] | null;
}) {
  return (
    <table className="w-full table-fixed border-collapse" style={{ fontSize: "1.35cqw" }}>
      <thead>
        <tr className="bg-pwr-dark-blue text-white">
          {colunas.map((c, i) => (
            <th
              key={c.titulo}
              className={`font-semibold ${i === 0 ? "text-left" : "text-center"}`}
              style={{ width: c.largura, padding: "0.75cqw 1cqw", fontSize: "1.15cqw" }}
            >
              {c.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha, i) => (
          <tr key={i} className={i % 2 === 1 ? "bg-pwr-dark-blue/[0.04]" : ""}>
            {linha.map((valor, j) => (
              <td
                key={j}
                className={`truncate ${j === 0 ? "text-left text-pwr-blue/80" : "text-center tabular-nums"} ${
                  j >= 1 ? "text-pwr-dark-blue" : ""
                }`}
                style={{ padding: "0.6cqw 1cqw" }}
              >
                {valor}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {total && (
        <tfoot>
          <tr
            className="bg-pwr-dark-blue/[0.07] font-semibold text-pwr-dark-blue"
            style={{ borderTop: "0.2cqw solid #FF5B00" }}
          >
            {total.map((valor, j) => (
              <td
                key={j}
                className={j === 0 ? "text-left" : "text-center tabular-nums"}
                style={{ padding: "0.7cqw 1cqw" }}
              >
                {valor}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}
