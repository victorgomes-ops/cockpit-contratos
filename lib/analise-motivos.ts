import {
  type BaseValor,
  type ContratoBase,
  type FatiaValor,
  MESES,
  agruparComValor,
  anosDisponiveis,
  filtrarPorIntervalo,
  normalizarBaseValor,
  normalizarInterno,
  rotuloDe,
  somarValorEncerrado,
  ultimoMesComDados,
  valorEncerrado,
} from "./contratos-base";
import { type Paragrafo, gerarResumoExecutivo } from "./resumo-executivo";

// Separador improvavel de aparecer num nome de motivo ou de gerente.
const SEP = "\u0000";

export type ParametrosMotivos = {
  ano?: string;
  mes?: string;
  ate?: string;
  interno?: string;
  valor?: string;
};

export type LinhaCruzamento = {
  motivo: string;
  gerente: string;
  contratos: number;
  receita: number;
  /** Repete o motivo da linha acima; a celula sai vazia na tabela. */
  continuacao?: boolean;
};

// Aceita "9" e "09": os seletores mandam dois digitos, mas uma URL colada a
// mao nao deveria cair silenciosamente no padrao.
function mesValido(valor: string | undefined): number | null {
  return valor && /^(0?[1-9]|1[0-2])$/.test(valor) ? Number(valor) : null;
}

// A aba Motivos e a aba Apresentacao mostram os mesmos numeros; calcular nas
// duas separadamente e so esperar que divirjam.
export function analisarMotivos(params: ParametrosMotivos) {
  const anos = anosDisponiveis("dataTerminoReal");
  const ano = params.ano && anos.includes(params.ano) ? params.ano : anos[0];
  const mes = mesValido(params.mes) ?? ultimoMesComDados("dataTerminoReal", ano);
  const ate = mesValido(params.ate) ?? mes;
  const interno = normalizarInterno(params.interno);
  const baseValor: BaseValor = normalizarBaseValor(params.valor);

  const doMes = filtrarPorIntervalo("dataTerminoReal", ano, mes, mes, interno);
  const doAcumulado = filtrarPorIntervalo("dataTerminoReal", ano, 1, ate, interno);

  const receitaMes = somarValorEncerrado(doMes, baseValor);
  const receitaAcumulada = somarValorEncerrado(doAcumulado, baseValor);

  const motivosMes = agruparComValor(doMes, (c) => c.motivoNaoRenovacao, baseValor);
  const motivosAcumulado = agruparComValor(doAcumulado, (c) => c.motivoNaoRenovacao, baseValor);
  const gerentesMes = agruparComValor(doMes, (c) => c.gerenteProjeto, baseValor);

  const cruzamento = agruparComValor(
    doMes,
    (c) => `${rotuloDe(c.motivoNaoRenovacao)}${SEP}${rotuloDe(c.gerenteProjeto)}`,
    baseValor
  ).map((f) => {
    const [motivo, gerente] = f.rotulo.split(SEP);
    return { motivo, gerente, contratos: f.contratos, receita: f.receita };
  });

  // Ordem: motivos como na tabela do mes, gerentes do maior para o menor.
  const linhasCruzamento: LinhaCruzamento[] = [];
  for (const m of motivosMes) {
    cruzamento
      .filter((x) => x.motivo === m.rotulo)
      .sort((a, b) => b.contratos - a.contratos || b.receita - a.receita)
      .forEach((x, i) => linhasCruzamento.push({ ...x, continuacao: i > 0 }));
  }

  const mesRotulo = `${MESES[mes - 1]} de ${ano}`;
  const acumuladoRotulo =
    ate === 1 ? `janeiro de ${ano}` : `janeiro a ${MESES[ate - 1].toLowerCase()} de ${ano}`;

  const maiorContrato = doMes
    .map((c) => ({ nome: c.nome, receita: valorEncerrado(c, baseValor) }))
    .sort((a, b) => b.receita - a.receita)[0];

  const resumo: Paragrafo[] = gerarResumoExecutivo({
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

  return {
    anos,
    ano,
    mes,
    ate,
    interno,
    baseValor,
    doMes,
    doAcumulado,
    receitaMes,
    receitaAcumulada,
    motivosMes,
    motivosAcumulado,
    gerentesMes,
    linhasCruzamento,
    mesRotulo,
    acumuladoRotulo,
    principal: motivosMes[0] as FatiaValor | undefined,
    resumo,
  };
}

export type Analise = ReturnType<typeof analisarMotivos>;
export type { ContratoBase };
