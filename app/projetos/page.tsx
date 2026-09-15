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

const colunasEntrada: Coluna[] = [
  { titulo: "Contrato", valor: (c) => c.nome },
  { titulo: "Cliente", valor: (c) => c.cliente },
  { titulo: "Data Entrada", valor: (c) => c.dataEntrada },
  { titulo: "Status", valor: (c) => c.status },
  { titulo: "Aceite do Cliente", valor: (c) => c.aceiteCliente },
  { titulo: "Unidade", valor: (c) => c.unidade },
  { titulo: "Gerente de Venda", valor: (c) => c.gerenteVenda },
  { titulo: "Valor Total", valor: (c) => c.valorTotal },
  { titulo: "Interno", valor: (c) => (c.interno ? "Sim" : "Não") },
];

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; interno?: string }>;
}) {
  const params = await searchParams;
  const mes = normalizarMes(params.mes);
  const interno = normalizarInterno(params.interno);

  const entradas = filtrarPorMes("dataEntrada", mes, interno);
  const base = getBaseContratos();

  const internos = entradas.filter((c) => c.interno).length;
  const externos = entradas.length - internos;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-pwr-dark-blue">Controle de Projetos</h1>
      <p className="mt-1 text-sm text-pwr-blue/60">
        {rotuloMes(mes)} — base atualizada em{" "}
        {new Date(base.gerado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
      </p>

      <div className="mt-6">
        <FiltrosMes mes={mes} interno={interno} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Entradas no mês"
          value={entradas.length}
          hint="Contratos com Data Entrada no mês selecionado"
        />
        <StatCard label="Externos" value={externos} />
        <StatCard label="Internos" value={internos} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-pwr-dark-blue">Entradas no mês</h2>
      <div className="mt-4">
        <TabelaContratos
          contratos={entradas}
          colunas={colunasEntrada}
          vazio="Nenhum projeto com entrada neste mês."
        />
      </div>
    </div>
  );
}
