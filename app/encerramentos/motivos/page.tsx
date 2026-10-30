import { FiltrosMotivos } from "@/components/FiltrosMotivos";
import { ResumoExecutivo } from "@/components/ResumoExecutivo";
import { StatCard } from "@/components/StatCard";
import { TabelaMotivos, type LinhaMotivo } from "@/components/TabelaMotivos";
import {
  MESES,
  ROTULO_BASE_VALOR,
  agruparComValor,
  anosDisponiveis,
  filtrarPorIntervalo,
  formatarMoeda,
  getBaseContratos,
  normalizarBaseValor,
  normalizarInterno,
  rotuloDe,
  somarValorEncerrado,
  ultimoMesComDados,
  valorEncerrado,
} from "@/lib/contratos-base";
import { gerarResumoExecutivo } from "@/lib/resumo-executivo";

// Separador improvavel de aparecer num nome de motivo ou de gerente.
const SEP = "\u0000";

// Aceita "9" e "09": os seletores mandam dois digitos, mas uma URL colada a
// mao nao deveria cair silenciosamente no padrao.
function mesValido(valor: string | undefined): number | null {
  return valor && /^(0?[1-9]|1[0-2])$/.test(valor) ? Number(valor) : null;
}

function umDecimal(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

export default async function MotivosPage({
  searchParams,
}: {
  searchParams: Promise<{
    ano?: string;
    mes?: string;
    ate?: string;
    interno?: string;
    valor?: string;
  }>;
}) {
  const params = await searchParams;
  const anos = anosDisponiveis("dataTerminoReal");
  const ano = params.ano && anos.includes(params.ano) ? params.ano : anos[0];
  const mes = mesValido(params.mes) ?? ultimoMesComDados("dataTerminoReal", ano);
  const ate = mesValido(params.ate) ?? mes;
  const interno = normalizarInterno(params.interno);
  const baseValor = normalizarBaseValor(params.valor);

  const doMes = filtrarPorIntervalo("dataTerminoReal", ano, mes, mes, interno);
  const doAcumulado = filtrarPorIntervalo("dataTerminoReal", ano, 1, ate, interno);

  const receitaMes = somarValorEncerrado(doMes, baseValor);
  const receitaAcumulada = somarValorEncerrado(doAcumulado, baseValor);

  const motivosMes = agruparComValor(doMes, (c) => c.motivoNaoRenovacao, baseValor);
  const motivosAcumulado = agruparComValor(
    doAcumulado,
    (c) => c.motivoNaoRenovacao,
    baseValor
  );
  const gerentesMes = agruparComValor(doMes, (c) => c.gerenteProjeto, baseValor);

  const cruzamento = agruparComValor(
    doMes,
    (c) => `${rotuloDe(c.motivoNaoRenovacao)}${SEP}${rotuloDe(c.gerenteProjeto)}`,
    baseValor
  ).map((f) => {
    const [motivo, gerente] = f.rotulo.split(SEP);
    return { motivo, gerente, contratos: f.contratos, receita: f.receita };
  });

  // As linhas do cruzamento seguem a ordem dos motivos do mes, e dentro de
  // cada motivo os gerentes vem do maior para o menor.
  const linhasCruzamento: LinhaMotivo[] = [];
  for (const m of motivosMes) {
    cruzamento
      .filter((x) => x.motivo === m.rotulo)
      .sort((a, b) => b.contratos - a.contratos || b.receita - a.receita)
      .forEach((x, i) =>
        linhasCruzamento.push({
          motivo: m.rotulo,
          gerente: x.gerente,
          contratos: x.contratos,
          receita: x.receita,
          continuacao: i > 0,
        })
      );
  }

  const mesRotulo = `${MESES[mes - 1]} de ${ano}`;
  const acumuladoRotulo =
    ate === 1 ? `janeiro de ${ano}` : `janeiro a ${MESES[ate - 1].toLowerCase()} de ${ano}`;

  const maiorContrato = doMes
    .map((c) => ({ nome: c.nome, receita: valorEncerrado(c, baseValor) }))
    .sort((a, b) => b.receita - a.receita)[0];

  const resumo = gerarResumoExecutivo({
    // Minusculo porque no resumo o mes aparece sempre no meio da frase.
    mesRotulo: mesRotulo.toLowerCase(),
    acumuladoRotulo,
    mesesNoAcumulado: ate,
    mesDentroDoAcumulado: mes <= ate,
    motivosMes,
    motivosAcumulado,
    gerentesMes,
    cruzamento,
    totalMes: { contratos: doMes.length, receita: receitaMes },
    totalAcumulado: { contratos: doAcumulado.length, receita: receitaAcumulada },
    maiorContrato: maiorContrato ?? null,
    semValorRegistrado: doMes.filter((c) => valorEncerrado(c, baseValor) === 0).length,
  });

  const principal = motivosMes[0];
  const base = getBaseContratos();

  return (
    <>
      <p className="mt-3 text-xs text-pwr-blue/50">
        {mesRotulo} — distribuição dos encerramentos por motivo. Receita encerrada medida
        por {ROTULO_BASE_VALOR[baseValor].toLowerCase()}. Base de{" "}
        {new Date(base.gerado).toLocaleDateString("pt-BR")}.
      </p>

      <FiltrosMotivos
        ano={ano}
        mes={mes}
        ate={ate}
        interno={interno}
        valor={baseValor}
        anosDisponiveis={anos}
      />

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <StatCard
          acento
          label="Contratos encerrados"
          value={doMes.length}
          hint={`Com término real em ${mesRotulo.toLowerCase()}`}
        />
        <StatCard
          label="Receita encerrada no mês"
          value={formatarMoeda(receitaMes)}
          hint={
            doMes.length > 0
              ? `${formatarMoeda(receitaMes / doMes.length)} por contrato, em média`
              : undefined
          }
        />
        <StatCard
          label="Receita acumulada"
          value={formatarMoeda(receitaAcumulada)}
          hint={`${acumuladoRotulo} · ${doAcumulado.length} contratos`}
        />
        <StatCard
          label="Principal motivo do mês"
          value={principal?.rotulo ?? "—"}
          hint={
            principal
              ? `${principal.contratos} de ${doMes.length} contratos (${umDecimal((principal.contratos / doMes.length) * 100)}%) · ${formatarMoeda(principal.receita)} (${umDecimal(receitaMes > 0 ? (principal.receita / receitaMes) * 100 : 0)}% da receita)`
              : undefined
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TabelaMotivos
          titulo={`Motivos de encerramento — ${mesRotulo.toLowerCase()}`}
          nota={`${doMes.length} contratos`}
          linhas={motivosMes.map((m) => ({
            motivo: m.rotulo,
            contratos: m.contratos,
            receita: m.receita,
          }))}
          totalContratos={doMes.length}
          totalReceita={receitaMes}
          vazio="Nenhum contrato encerrado no mês selecionado."
        />

        <TabelaMotivos
          titulo={`Motivos no acumulado — ${acumuladoRotulo}`}
          nota={`${doAcumulado.length} contratos`}
          linhas={motivosAcumulado.map((m) => ({
            motivo: m.rotulo,
            contratos: m.contratos,
            receita: m.receita,
          }))}
          totalContratos={doAcumulado.length}
          totalReceita={receitaAcumulada}
          vazio="Nenhum contrato encerrado no período acumulado."
        />
      </div>

      <div className="mt-4">
        <TabelaMotivos
          titulo={`Motivo por gerente de projeto — ${mesRotulo.toLowerCase()}`}
          nota="Somente o mês de referência"
          linhas={linhasCruzamento}
          totalContratos={doMes.length}
          totalReceita={receitaMes}
          colunaSub="Gerente"
          vazio="Nenhum contrato encerrado no mês selecionado."
        />
      </div>

      <div className="mt-5">
        <ResumoExecutivo paragrafos={resumo} periodo={mesRotulo} />
      </div>
    </>
  );
}
