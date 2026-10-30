// Montagem do HTML que vai para a area de transferencia. O PowerPoint cola
// tabela HTML como tabela editavel, desde que o estilo venha inline — classe
// e folha externa ele descarta.

const AZUL = "#05244F";
const LARANJA = "#FF5B00";
const BORDA = "#D8DEE8";

const celula = (alinhamento: string) =>
  `padding:6px 10px;border:1px solid ${BORDA};text-align:${alinhamento};font-size:11pt;`;

export type ColunaExport = { titulo: string; alinhamento?: "left" | "center" | "right" };

export function tabelaHtml(
  colunas: ColunaExport[],
  linhas: string[][],
  total: string[] | null,
  legenda?: string
): string {
  const cabecalho = colunas
    .map(
      (c) =>
        `<th style="${celula(c.alinhamento ?? "center")}background:${AZUL};color:#fff;font-weight:600;">${escapar(c.titulo)}</th>`
    )
    .join("");

  const corpo = linhas
    .map(
      (linha, i) =>
        `<tr${i % 2 === 1 ? ' style="background:#F4F6FA;"' : ""}>` +
        linha
          .map(
            (valor, j) =>
              `<td style="${celula(colunas[j]?.alinhamento ?? "center")}">${escapar(valor)}</td>`
          )
          .join("") +
        "</tr>"
    )
    .join("");

  const rodape = total
    ? `<tr>${total
        .map(
          (valor, j) =>
            `<td style="${celula(colunas[j]?.alinhamento ?? "center")}background:#EDF0F6;font-weight:700;border-top:2px solid ${LARANJA};">${escapar(valor)}</td>`
        )
        .join("")}</tr>`
    : "";

  const titulo = legenda
    ? `<p style="font-family:Arial,sans-serif;font-size:12pt;font-weight:700;color:${AZUL};margin:0 0 6px;">${escapar(legenda)}</p>`
    : "";

  return (
    titulo +
    `<table style="border-collapse:collapse;font-family:Arial,sans-serif;color:${AZUL};">` +
    `<thead><tr>${cabecalho}</tr></thead><tbody>${corpo}${rodape}</tbody></table>`
  );
}

// Versao em texto: separada por tabulacao, que o Excel e o proprio PowerPoint
// entendem quando a cola HTML nao esta disponivel.
export function tabelaTexto(
  colunas: ColunaExport[],
  linhas: string[][],
  total: string[] | null,
  legenda?: string
): string {
  const partes = [
    ...(legenda ? [legenda] : []),
    colunas.map((c) => c.titulo).join("\t"),
    ...linhas.map((l) => l.join("\t")),
    ...(total ? [total.join("\t")] : []),
  ];
  return partes.join("\n");
}

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type LinhaExport = { rotulos: string[]; contratos: number; receita: number };

// Um slide nao comporta vinte linhas. O excedente vira uma linha agregada
// para o total continuar fechando com a tabela da aba Motivos.
export function limitarLinhas(linhas: LinhaExport[], maximo: number): LinhaExport[] {
  if (linhas.length <= maximo) return linhas;
  const principais = linhas.slice(0, maximo);
  const resto = linhas.slice(maximo);
  const soma = resto.reduce(
    (t, l) => ({ contratos: t.contratos + l.contratos, receita: t.receita + l.receita }),
    { contratos: 0, receita: 0 }
  );
  const vazios = principais[0].rotulos.map((_, i) => (i === 0 ? `Demais (${resto.length})` : ""));
  return [...principais, { rotulos: vazios, contratos: soma.contratos, receita: soma.receita }];
}
