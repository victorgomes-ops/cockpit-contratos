import { FiltrosMes } from "@/components/FiltrosMes";
import { StatCard } from "@/components/StatCard";
import { TabelaContratos, type Coluna } from "@/components/TabelaContratos";
import {
  filtrarPorMes,
  getBaseContratos,
  normalizarInterno,
  normalizarMes,
  rotuloMes,
} from "@/lib/contratos-base";

const colunasRenovacao: Coluna[] = [
  { titulo: "Contrato", valor: (c) => c.nome },
  { titulo: "Cliente", valor: (c) => c.cliente },
  { titulo: "Data de Renovação", valor: (c) => c.dataRenovacao },
  { titulo: "Status", valor: (c) => c.status },
  { titulo: "Unidade", valor: (c) => c.unidade },
  { titulo: "Gerente de Projeto", valor: (c) => c.gerenteProjeto },
  { titulo: "Valor Total", valor: (c) => c.valorTotal },
  { titulo: "Interno", valor: (c) => (c.interno ? "Sim" : "Não") },
];

const colunasEncerramento: Coluna[] = [
  { titulo: "Contrato", valor: (c) => c.nome },
  { titulo: "Cliente", valor: (c) => c.cliente },
  { titulo: "Término Vendido", valor: (c) => c.dataTerminoVendido },
  { titulo: "Status", valor: (c) => c.status },
  { titulo: "Unidade", valor: (c) => c.unidade },
  { titulo: "Gerente de Projeto", valor: (c) => c.gerenteProjeto },
  { titulo: "Receita Recorrente", valor: (c) => c.receitaRecorrente },
  { titulo: "Interno", valor: (c) => (c.interno ? "Sim" : "Não") },
];

export default async function RenovacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; interno?: string }>;
}) {
  const params = await searchParams;
  const mes = normalizarMes(params.mes);
  const interno = normalizarInterno(params.interno);

  const renovam = filtrarPorMes("dataRenovacao", mes, interno);
  const encerram = filtrarPorMes("dataTerminoVendido", mes, interno);
  const base = getBaseContratos();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-pwr-dark-blue">Renovações</h1>
      <p className="mt-1 text-sm text-pwr-blue/60">
        {rotuloMes(mes)} — base atualizada em{" "}
        {new Date(base.gerado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
      </p>

      <div className="mt-6">
        <FiltrosMes mes={mes} interno={interno} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Renovam no mês"
          value={renovam.length}
          hint="Contratos com Data de Renovação no mês selecionado"
        />
        <StatCard
          label="Encerram no mês"
          value={encerram.length}
          hint="Contratos com Data Término Vendido no mês selecionado"
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-pwr-dark-blue">Renovam no mês</h2>
      <div className="mt-4">
        <TabelaContratos
          contratos={renovam}
          colunas={colunasRenovacao}
          vazio="Nenhum contrato com renovação registrada neste mês."
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-pwr-dark-blue">Encerram no mês</h2>
      <div className="mt-4">
        <TabelaContratos
          contratos={encerram}
          colunas={colunasEncerramento}
          vazio="Nenhum contrato com término vendido neste mês."
        />
      </div>
    </div>
  );
}
