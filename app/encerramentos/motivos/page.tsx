import { FiltrosMotivos } from "@/components/FiltrosMotivos";
import { ResumoExecutivo } from "@/components/ResumoExecutivo";
import { StatCard } from "@/components/StatCard";
import { TabelaMotivos } from "@/components/TabelaMotivos";
import { type ParametrosMotivos, analisarMotivos } from "@/lib/analise-motivos";
import { ROTULO_BASE_VALOR, formatarMoeda, getBaseContratos } from "@/lib/contratos-base";

function umDecimal(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

export default async function MotivosPage({
  searchParams,
}: {
  searchParams: Promise<ParametrosMotivos>;
}) {
  const a = analisarMotivos(await searchParams);
  const base = getBaseContratos();

  return (
    <>
      <p className="mt-3 text-xs text-pwr-blue/50">
        {a.mesRotulo} — distribuição dos encerramentos por motivo. Receita encerrada medida
        por {ROTULO_BASE_VALOR[a.baseValor].toLowerCase()}. Base de{" "}
        {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <FiltrosMotivos
        ano={a.ano}
        mes={a.mes}
        ate={a.ate}
        interno={a.interno}
        valor={a.baseValor}
        anosDisponiveis={a.anos}
      />

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          acento
          label="Contratos encerrados"
          value={a.doMes.length}
          hint={`Com término real em ${a.mesRotulo.toLowerCase()}`}
        />
        <StatCard
          label="Receita encerrada no mês"
          value={formatarMoeda(a.receitaMes)}
          hint={
            a.doMes.length > 0
              ? `${formatarMoeda(a.receitaMes / a.doMes.length)} por contrato, em média`
              : undefined
          }
        />
        <StatCard
          label="Receita acumulada"
          value={formatarMoeda(a.receitaAcumulada)}
          hint={`${a.acumuladoRotulo} · ${a.doAcumulado.length} contratos`}
        />
        <StatCard
          label="Principal motivo do mês"
          value={a.principal?.rotulo ?? "—"}
          hint={
            a.principal
              ? `${a.principal.contratos} de ${a.doMes.length} contratos (${umDecimal((a.principal.contratos / a.doMes.length) * 100)}%) · ${formatarMoeda(a.principal.receita)} (${umDecimal(a.receitaMes > 0 ? (a.principal.receita / a.receitaMes) * 100 : 0)}% da receita)`
              : undefined
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TabelaMotivos
          titulo={`Motivos de encerramento — ${a.mesRotulo.toLowerCase()}`}
          nota={`${a.doMes.length} contratos`}
          linhas={a.motivosMes.map((m) => ({
            motivo: m.rotulo,
            contratos: m.contratos,
            receita: m.receita,
          }))}
          totalContratos={a.doMes.length}
          totalReceita={a.receitaMes}
          vazio="Nenhum contrato encerrado no mês selecionado."
        />

        <TabelaMotivos
          titulo={`Motivos no acumulado — ${a.acumuladoRotulo}`}
          nota={`${a.doAcumulado.length} contratos`}
          linhas={a.motivosAcumulado.map((m) => ({
            motivo: m.rotulo,
            contratos: m.contratos,
            receita: m.receita,
          }))}
          totalContratos={a.doAcumulado.length}
          totalReceita={a.receitaAcumulada}
          vazio="Nenhum contrato encerrado no período acumulado."
        />
      </div>

      <div className="mt-4">
        <TabelaMotivos
          titulo={`Motivo por gerente de projeto — ${a.mesRotulo.toLowerCase()}`}
          nota="Somente o mês de referência"
          linhas={a.linhasCruzamento}
          totalContratos={a.doMes.length}
          totalReceita={a.receitaMes}
          colunaSub="Gerente"
          vazio="Nenhum contrato encerrado no mês selecionado."
        />
      </div>

      <div className="mt-5">
        <ResumoExecutivo paragrafos={a.resumo} periodo={a.mesRotulo} />
      </div>
    </>
  );
}
