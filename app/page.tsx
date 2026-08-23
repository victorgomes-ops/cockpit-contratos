import { StatCard } from "@/components/StatCard";
import { ComingSoonCard } from "@/components/ComingSoonCard";
import { contarPor, getContratosResumo } from "@/lib/queries/contratos";

export default async function OverviewPage() {
  const { contratos, total, atualizadoEm } = await getContratosResumo();

  const porStatus = contarPor(contratos, (c) => c.status);
  const porUnidade = contarPor(contratos, (c) => c.unidade);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-pwr-dark-blue">Visão Geral</h1>
      <p className="mt-1 text-sm text-pwr-blue/60">
        Dados de contratos sincronizados em {formatarData(atualizadoEm)}.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de Contratos" value={total} />
        {Object.entries(porStatus).map(([status, qtd]) => (
          <StatCard key={status} label={`Status: ${status}`} value={qtd} />
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-pwr-dark-blue">Por Unidade</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(porUnidade).map(([unidade, qtd]) => (
          <StatCard key={unidade} label={unidade} value={qtd} />
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-pwr-dark-blue">Acompanhamento</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ComingSoonCard
          title="Renovações do mês"
          note="Depende do campo 'Data de Renovação' da planilha completa, que ainda não está sincronizado no Supabase — hoje só o resumo com 7 campos está disponível."
        />
        <ComingSoonCard
          title="Clientes"
          note="A base de Clientes ainda não foi carregada no Supabase. Entra na próxima etapa de ingestão, junto com as regras de negócio do cockpit."
        />
      </div>
    </div>
  );
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
