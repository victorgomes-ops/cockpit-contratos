import { CabecalhoTabela } from "@/components/CabecalhoTabela";
import { FiltrosPeriodo } from "@/components/FiltrosPeriodo";
import { GraficoBarras } from "@/components/GraficoBarras";
import { GraficoRosca } from "@/components/GraficoRosca";
import { StatCard } from "@/components/StatCard";
import { TabelaOrdenavel, type ChaveColuna } from "@/components/TabelaOrdenavel";
import {
  MESES,
  agruparPor,
  anosDisponiveis,
  contarSemDataValida,
  filtrarPorPeriodo,
  formatarMoeda,
  getBaseContratos,
  limitarComOutros,
  normalizarInterno,
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
  searchParams: Promise<{ ano?: string; mes?: string; interno?: string }>;
}) {
  const params = await searchParams;
  const anos = anosDisponiveis("dataTerminoReal");
  const ano = params.ano && anos.includes(params.ano) ? params.ano : anos[0];
  const mes = params.mes && /^(0[1-9]|1[0-2])$/.test(params.mes) ? params.mes : "todos";
  const interno = normalizarInterno(params.interno);

  const encerrados = filtrarPorPeriodo("dataTerminoReal", ano, mes, interno);
  const base = getBaseContratos();

  const porGerente = limitarComOutros(
    agruparPor(encerrados, (c) => c.gerenteProjeto),
    10
  );
  const porUnidade = agruparPor(encerrados, (c) => c.unidade);
  const porMotivo = agruparPor(encerrados, (c) => c.motivoNaoRenovacao);

  const periodo = mes === "todos" ? `Ano de ${ano}` : `${MESES[Number(mes) - 1]} de ${ano}`;
  const parcelaTotal = somarParcelaFechada(encerrados);
  const semData = contarSemDataValida("dataTerminoReal");

  return (
    <div className="px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Encerramentos</h1>
      <p className="mt-0.5 text-xs text-pwr-blue/50">
        {periodo} — projetos com término real no período. Base de{" "}
        {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <div className="mt-4">
        <FiltrosPeriodo ano={ano} mes={mes} interno={interno} anosDisponiveis={anos} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          label="Projetos encerrados"
          value={encerrados.length}
          hint="Com data de término real no período"
        />
        <StatCard
          label="Parcela fechada"
          value={formatarMoeda(parcelaTotal)}
          hint="Soma das parcelas dos encerrados"
        />
        <StatCard
          label="Principal motivo"
          value={porMotivo[0]?.rotulo ?? "—"}
          hint={porMotivo[0] ? `${porMotivo[0].quantidade} projetos` : undefined}
        />
        <StatCard
          label="Gerente com mais baixas"
          value={porGerente[0]?.rotulo ?? "—"}
          hint={porGerente[0] ? `${porGerente[0].quantidade} projetos` : undefined}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <GraficoBarras
          titulo="Encerramentos por Gerente de Projeto"
          fatias={porGerente}
          vazio="Nenhum encerramento no período."
        />
        <GraficoRosca
          titulo="Encerramentos por Unidade"
          fatias={porUnidade}
          vazio="Nenhum encerramento no período."
        />
      </div>

      <div className="mt-5">
        <CabecalhoTabela
          titulo={`Projetos encerrados — ${periodo.toLowerCase()}`}
          projetos={encerrados.length}
          valor={formatarMoeda(parcelaTotal)}
          rotuloValor="parcela"
        />
        <TabelaOrdenavel
          contratos={encerrados}
          colunas={colunas}
          ordemInicial="dataTerminoReal"
          vazio="Nenhum projeto encerrado no período selecionado."
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
    </div>
  );
}
