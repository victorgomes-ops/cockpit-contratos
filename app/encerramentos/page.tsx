import { CabecalhoTabela } from "@/components/CabecalhoTabela";
import { FiltrosAtivos, type FiltroAtivo } from "@/components/FiltrosAtivos";
import { FiltrosPeriodo } from "@/components/FiltrosPeriodo";
import { GraficoBarras } from "@/components/GraficoBarras";
import { GraficoRosca } from "@/components/GraficoRosca";
import { Sparkline } from "@/components/Sparkline";
import { StatCard } from "@/components/StatCard";
import { TabelaOrdenavel, type ChaveColuna } from "@/components/TabelaOrdenavel";
import {
  MESES,
  agruparPor,
  anosDisponiveis,
  contagemPorMes,
  contarSemDataValida,
  duracaoMediaMeses,
  filtrarPorPeriodo,
  formatarMoeda,
  getBaseContratos,
  limitarComOutros,
  normalizarInterno,
  periodoAnterior,
  rotuloDe,
  somarParcelaFechada,
} from "@/lib/contratos-base";

const colunas: ChaveColuna[] = [
  "nome",
  "motivoNaoRenovacao",
  "dataTerminoReal",
  "gerenteProjeto",
  "motivoDetalhe",
  "parcelaFechada",
];

export default async function EncerramentosPage({
  searchParams,
}: {
  searchParams: Promise<{
    ano?: string;
    mes?: string;
    interno?: string;
    gerente?: string;
    unidade?: string;
  }>;
}) {
  const params = await searchParams;
  const anos = anosDisponiveis("dataTerminoReal");
  const ano = params.ano && anos.includes(params.ano) ? params.ano : anos[0];
  const mes = params.mes && /^(0[1-9]|1[0-2])$/.test(params.mes) ? params.mes : "todos";
  const interno = normalizarInterno(params.interno);
  const gerente = (params.gerente ?? "").trim();
  const unidade = (params.unidade ?? "").trim();

  const doPeriodo = filtrarPorPeriodo("dataTerminoReal", ano, mes, interno);

  const casaGerente = (c: { gerenteProjeto: string }) =>
    !gerente || rotuloDe(c.gerenteProjeto) === gerente;
  const casaUnidade = (c: { unidade: string }) => !unidade || rotuloDe(c.unidade) === unidade;

  // Cada grafico ignora o proprio filtro e aplica o do outro. Assim a coluna
  // clicada continua na tela (destacada) e da para trocar de gerente sem
  // precisar limpar nada antes.
  const fatiasGerente = limitarComOutros(
    agruparPor(doPeriodo.filter(casaUnidade), (c) => c.gerenteProjeto),
    10
  );
  const fatiasUnidade = agruparPor(doPeriodo.filter(casaGerente), (c) => c.unidade);

  const selecionados = doPeriodo.filter(casaGerente).filter(casaUnidade);

  // Mesmo recorte, periodo anterior: so assim o delta compara igual com igual.
  const anterior = periodoAnterior(ano, mes);
  const doPeriodoAnterior = filtrarPorPeriodo(
    "dataTerminoReal",
    anterior.ano,
    anterior.mes,
    interno
  )
    .filter(casaGerente)
    .filter(casaUnidade);

  const doAno = filtrarPorPeriodo("dataTerminoReal", ano, "todos", interno)
    .filter(casaGerente)
    .filter(casaUnidade);

  const porMotivo = agruparPor(selecionados, (c) => c.motivoNaoRenovacao);
  const parcelaTotal = somarParcelaFechada(selecionados);
  const parcelaAnterior = somarParcelaFechada(doPeriodoAnterior);
  const duracao = duracaoMediaMeses(selecionados);
  const semData = contarSemDataValida("dataTerminoReal");

  const periodo = mes === "todos" ? `Ano de ${ano}` : `${MESES[Number(mes) - 1]} de ${ano}`;
  const recorte = [gerente, unidade].filter(Boolean).join(" · ");

  const filtrosAtivos: FiltroAtivo[] = [
    ...(gerente ? [{ chave: "gerente", rotuloCampo: "Gerente", valor: gerente }] : []),
    ...(unidade ? [{ chave: "unidade", rotuloCampo: "Unidade", valor: unidade }] : []),
  ];

  const base = getBaseContratos();
  const umDecimal = (n: number) => n.toFixed(1).replace(".", ",");

  return (
    <>
      <p className="mt-3 text-xs text-pwr-blue/50">
        {periodo} — projetos com término real no período. Clique numa coluna ou fatia dos
        gráficos para filtrar. Base de {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <div className="mt-4">
        <FiltrosPeriodo ano={ano} mes={mes} interno={interno} anosDisponiveis={anos} />
      </div>

      <FiltrosAtivos filtros={filtrosAtivos} />

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          acento
          label="Projetos encerrados"
          value={selecionados.length}
          delta={{
            diferenca: selecionados.length - doPeriodoAnterior.length,
            rotulo: `vs. ${anterior.rotulo}`,
          }}
          grafico={
            <Sparkline
              valores={contagemPorMes(doAno, "dataTerminoReal")}
              destaque={mes === "todos" ? null : Number(mes) - 1}
              ano={ano}
            />
          }
        />
        <StatCard
          label="Parcela fechada"
          value={formatarMoeda(parcelaTotal)}
          delta={{
            diferenca: parcelaTotal - parcelaAnterior,
            texto: formatarMoeda(Math.abs(parcelaTotal - parcelaAnterior)),
            rotulo: `vs. ${anterior.rotulo}`,
          }}
          hint={
            selecionados.length > 0
              ? `${formatarMoeda(parcelaTotal / selecionados.length)} por projeto, em média`
              : undefined
          }
        />
        <StatCard
          label="Duração média"
          value={duracao.considerados > 0 ? `${umDecimal(duracao.media)} meses` : "—"}
          hint={
            duracao.considerados > 0
              ? `Da entrada ao término real · ${duracao.considerados} de ${selecionados.length} com as duas datas`
              : "Nenhum projeto com entrada e término preenchidos"
          }
        />
        <StatCard
          label="Principal motivo"
          value={porMotivo[0]?.rotulo ?? "—"}
          hint={
            porMotivo[0]
              ? `${porMotivo[0].quantidade} de ${selecionados.length} projetos (${umDecimal((porMotivo[0].quantidade / selecionados.length) * 100)}%)`
              : undefined
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <GraficoBarras
          titulo="Encerramentos por Gerente de Projeto"
          fatias={fatiasGerente}
          vazio="Nenhum encerramento no período."
          filtro="gerente"
          selecionado={gerente}
        />
        <GraficoRosca
          titulo="Encerramentos por Unidade"
          fatias={fatiasUnidade}
          vazio="Nenhum encerramento no período."
          filtro="unidade"
          selecionado={unidade}
        />
      </div>

      <div className="mt-5">
        <CabecalhoTabela
          titulo={`Projetos encerrados — ${periodo.toLowerCase()}${recorte ? ` · ${recorte}` : ""}`}
          projetos={selecionados.length}
          valor={formatarMoeda(parcelaTotal)}
          rotuloValor="parcela"
        />
        <TabelaOrdenavel
          contratos={selecionados}
          colunas={colunas}
          ordemInicial="dataTerminoReal"
          vazio={
            recorte
              ? `Nenhum projeto de ${recorte} encerrado em ${periodo.toLowerCase()}. Remova o filtro acima para ver todos.`
              : "Nenhum projeto encerrado no período selecionado."
          }
        />
      </div>

      {semData > 0 && (
        <p className="mt-3 text-[11px] leading-relaxed text-pwr-blue/45">
          <strong className="font-medium text-pwr-blue/60">Fora desta contagem:</strong>{" "}
          {semData} contratos estão com a Data de Término Real em branco na planilha (exportada
          como 31/12/1899, o dia zero do Excel). Como não há data, eles não entram em nenhum
          período e não aparecem aqui — vale conferir se foram mesmo encerrados.
        </p>
      )}
    </>
  );
}
