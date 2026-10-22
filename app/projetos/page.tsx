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
    <div className="px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Controle de Projetos</h1>
      <p className="mt-0.5 text-xs text-pwr-blue/50">
        {rotuloMes(mes)} — base de {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <div className="mt-4">
        <FiltrosMes mes={mes} interno={interno} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 lg:max-w-2xl">
        <StatCard label="Entradas no mês" value={entradas.length} hint="Data Entrada no mês" />
        <StatCard label="Externos" value={externos} />
        <StatCard label="Internos" value={internos} />
      </div>

      <h2 className="mt-6 mb-2 text-[13px] font-semibold text-pwr-dark-blue">Entradas no mês</h2>
      <div>
        <TabelaContratos
          contratos={entradas}
          colunas={colunasEntrada}
          vazio="Nenhum projeto com entrada neste mês."
        />
      </div>
    </div>
  );
}
