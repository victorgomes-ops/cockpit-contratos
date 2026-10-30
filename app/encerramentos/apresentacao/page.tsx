import { BotaoCopiar } from "@/components/BotaoCopiar";
import { BotaoCopiarImagem } from "@/components/BotaoCopiarImagem";
import { FiltrosMotivos } from "@/components/FiltrosMotivos";
import type { LinhaPainel } from "@/components/PainelBarras";
import { type CartaoKpi, SlideMotivos } from "@/components/SlideMotivos";
import { type ParametrosMotivos, analisarMotivos } from "@/lib/analise-motivos";
import {
  type FatiaValor,
  MESES,
  ROTULO_BASE_VALOR,
  agruparComValor,
  filtrarPorIntervalo,
  formatarMoedaExata,
  formatarNumeroExato,
  getBaseContratos,
  somarValorEncerrado,
} from "@/lib/contratos-base";
import { type ColunaExport, tabelaHtml, tabelaTexto } from "@/lib/exportar";
import { gerarLeitura } from "@/lib/leitura-executiva";

const MAX_MOTIVOS = 8;
const MAX_GERENTES = 10;

// Ordena por receita, nao por contagem: num slide de resultado o que manda e
// o dinheiro. Dois contratos de Perfil pesam mais que tres de Renovado.
function porReceita(fatias: FatiaValor[]): FatiaValor[] {
  return [...fatias].sort((a, b) => b.receita - a.receita || b.contratos - a.contratos);
}

// Mantem o total fechando quando a cauda nao cabe no painel.
function limitar(fatias: FatiaValor[], maximo: number): LinhaPainel[] {
  const linhas = fatias.map((f) => ({
    rotulo: f.rotulo,
    contratos: f.contratos,
    receita: f.receita,
  }));
  if (linhas.length <= maximo) return linhas;
  const resto = linhas.slice(maximo);
  return [
    ...linhas.slice(0, maximo),
    {
      rotulo: `Outros (${resto.length})`,
      contratos: resto.reduce((t, l) => t + l.contratos, 0),
      receita: resto.reduce((t, l) => t + l.receita, 0),
    },
  ];
}

export default async function ApresentacaoPage({
  searchParams,
}: {
  searchParams: Promise<ParametrosMotivos>;
}) {
  const a = analisarMotivos(await searchParams);
  const base = getBaseContratos();

  const motivosMes = porReceita(a.motivosMes);
  const motivosAcumulado = porReceita(a.motivosAcumulado);
  const gerentesMes = porReceita(a.gerentesMes);

  const nomeMes = MESES[a.mes - 1];
  const nomeMesAcumulado = MESES[a.ate - 1];

  // KPI 1: a composicao por status diz se o mes foi baixa definitiva ou pausa.
  const porStatus = new Map<string, number>();
  for (const c of a.doMes) porStatus.set(c.status, (porStatus.get(c.status) ?? 0) + 1);
  const notaStatus =
    [...porStatus.entries()]
      .sort((x, y) => y[1] - x[1])
      .map(([s, n]) => `${n} ${s}`)
      .join(" · ") || "sem status registrado";

  // KPI 2: o mes comparado ao anterior, em multiplo quando sobe e em queda
  // percentual quando desce — "0,5x" nao se le tao rapido quanto "-52%".
  const mesAnterior = a.mes > 1 ? a.mes - 1 : null;
  const doMesAnterior = mesAnterior
    ? filtrarPorIntervalo("dataTerminoReal", a.ano, mesAnterior, mesAnterior, a.interno)
    : [];
  const receitaAnterior = somarValorEncerrado(doMesAnterior, a.baseValor);
  let notaReceita: string | undefined;
  if (mesAnterior && receitaAnterior > 0) {
    const razao = a.receitaMes / receitaAnterior;
    const nomeAnterior = MESES[mesAnterior - 1];
    const valor = formatarMoedaExata(receitaAnterior);
    notaReceita =
      razao >= 1.1
        ? `${razao.toFixed(1).replace(".", ",")}x ${nomeAnterior} (${valor})`
        : razao <= 0.9
          ? `−${Math.round((1 - razao) * 100)}% vs ${nomeAnterior} (${valor})`
          : `em linha com ${nomeAnterior} (${valor})`;
  }

  // KPI 3: marco de milhao, quando houver. Fato, nao meta.
  const milhoes = Math.floor(a.receitaAcumulada / 1_000_000);
  const notaAcumulado = [
    `${a.doAcumulado.length} contratos`,
    milhoes >= 1 ? `ultrapassou R$ ${milhoes} milhã${milhoes > 1 ? "os" : "o"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Mesma regra da leitura: o cartao de destaque mostra o maior motivo
  // registrado, nao o campo em branco (que aparece no painel 01 e no texto).
  const lider = motivosMes.find((m) => m.rotulo !== "Sem informação") ?? motivosMes[0];
  const kpis: CartaoKpi[] = [
    {
      rotulo: "Contratos encerrados",
      valor: String(a.doMes.length),
      nota: notaStatus,
      estilo: "claro",
    },
    {
      rotulo: "Receita encerrada no mês",
      valor: formatarMoedaExata(a.receitaMes),
      nota: notaReceita,
      estilo: "laranja",
    },
    {
      rotulo: `Acumulado jan–${nomeMesAcumulado.slice(0, 3).toLowerCase()} ${a.ano}`,
      valor: formatarMoedaExata(a.receitaAcumulada),
      nota: notaAcumulado,
      estilo: "escuro",
    },
    {
      rotulo: lider ? lider.rotulo : "Principal motivo",
      valor: lider ? String(lider.contratos) : "—",
      nota: lider
        ? `${formatarMoedaExata(lider.receita)} · ${((lider.receita / a.receitaMes) * 100).toFixed(0)}% da receita do mês`
        : undefined,
      estilo: "claro",
    },
  ];

  const linhasMes = limitar(motivosMes, MAX_MOTIVOS);
  const linhasAcumulado = limitar(motivosAcumulado, MAX_MOTIVOS);
  const linhasGerentes = limitar(gerentesMes, MAX_GERENTES);

  const leitura = gerarLeitura({
    ano: a.ano,
    mes: a.mes,
    interno: a.interno,
    baseValor: a.baseValor,
    doMes: a.doMes,
    receitaMes: a.receitaMes,
    motivosPorReceita: motivosMes,
  });

  // Exportacao das tres tabelas e do texto, para quem prefere colar como
  // tabela editavel em vez de imagem.
  const colunas: ColunaExport[] = [
    { titulo: "Linha", alinhamento: "left" },
    { titulo: "Contratos" },
    { titulo: "Receita encerrada" },
    { titulo: "% receita" },
  ];
  const paraExport = (linhas: LinhaPainel[], total: number) =>
    linhas.map((l) => [
      l.rotulo,
      String(l.contratos),
      formatarNumeroExato(l.receita),
      total > 0 ? `${((l.receita / total) * 100).toFixed(1).replace(".", ",")}%` : "—",
    ]);

  const blocos = [
    {
      titulo: `Motivo — ${nomeMes} de ${a.ano}`,
      linhas: paraExport(linhasMes, a.receitaMes),
      total: ["Total", String(a.doMes.length), formatarNumeroExato(a.receitaMes), "100,0%"],
    },
    {
      titulo: `Motivo — janeiro a ${nomeMesAcumulado.toLowerCase()} de ${a.ano}`,
      linhas: paraExport(linhasAcumulado, a.receitaAcumulada),
      total: [
        "Total",
        String(a.doAcumulado.length),
        formatarNumeroExato(a.receitaAcumulada),
        "100,0%",
      ],
    },
    {
      titulo: `Gerente de projeto — ${nomeMes} de ${a.ano}`,
      linhas: paraExport(linhasGerentes, a.receitaMes),
      total: ["Total", String(a.doMes.length), formatarNumeroExato(a.receitaMes), "100,0%"],
    },
  ];

  const textoLeitura = leitura
    ? `Leitura executiva — ${leitura.titulo}\n${leitura.frases.join(" ").replace(/\*\*/g, "")}`
    : "";

  return (
    <>
      <div className="nao-imprimir">
        <p className="mt-3 text-xs text-pwr-blue/50">
          Um slide, 16:9, com os mesmos números da aba Motivos.{" "}
          <strong className="font-medium text-pwr-blue/70">Copiar imagem do slide</strong> põe a
          figura pronta na área de transferência — é só colar no PowerPoint. Se preferir os
          números editáveis em vez da figura, use os botões de tabela ao lado.
        </p>

        <FiltrosMotivos
          ano={a.ano}
          mes={a.mes}
          ate={a.ate}
          interno={a.interno}
          valor={a.baseValor}
          anosDisponiveis={a.anos}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <BotaoCopiarImagem
            alvo=".slide"
            nomeArquivo={`encerramentos-${nomeMes.toLowerCase()}-${a.ano}.png`}
          />
          <span className="mx-1 h-5 w-px bg-pwr-dark-blue/15" />
          {blocos.map((b, i) => (
            <BotaoCopiar
              key={b.titulo}
              rotulo={["Copiar motivos do mês", "Copiar acumulado", "Copiar gerentes"][i]}
              html={tabelaHtml(colunas, b.linhas, b.total, b.titulo)}
              texto={tabelaTexto(colunas, b.linhas, b.total, b.titulo)}
            />
          ))}
          {leitura && (
            <BotaoCopiar rotulo="Copiar leitura executiva" texto={textoLeitura} />
          )}
        </div>
      </div>

      <div className="mt-4">
        <SlideMotivos
          periodo={`${nomeMes.toUpperCase()} ${a.ano}`}
          notaBase={`Base SPWR · ${ROTULO_BASE_VALOR[a.baseValor]} · atualizada em ${new Date(base.gerado).toLocaleDateString("pt-BR")}`}
          kpis={kpis}
          paineis={[
            {
              numero: "01",
              titulo: `Motivo — ${nomeMes}`,
              nota: `${a.doMes.length} contratos`,
              linhas: linhasMes,
              rotuloTotal: `Total ${nomeMes}`,
              totalContratos: a.doMes.length,
              totalReceita: a.receitaMes,
            },
            {
              numero: "02",
              titulo: `Motivo — Jan a ${nomeMesAcumulado.slice(0, 3)}`,
              nota: `${a.doAcumulado.length} contratos`,
              linhas: linhasAcumulado,
              rotuloTotal: "Total geral",
              totalContratos: a.doAcumulado.length,
              totalReceita: a.receitaAcumulada,
            },
            {
              numero: "03",
              titulo: `Gerente de Projeto — ${nomeMes}`,
              nota: `${gerentesMes.length} GPs`,
              linhas: linhasGerentes,
              rotuloTotal: `Total ${nomeMes}`,
              totalContratos: a.doMes.length,
              totalReceita: a.receitaMes,
            },
          ]}
          leitura={leitura}
        />
      </div>
    </>
  );
}
