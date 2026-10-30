import {
  type BaseValor,
  type ContratoBase,
  type FatiaValor,
  type FiltroInterno,
  MESES,
  agruparComValor,
  filtrarPorIntervalo,
  formatarMoedaExata,
  rotuloDe,
  somarValorEncerrado,
  valorEncerrado,
} from "./contratos-base";

// O texto do rodape do slide. Sai dos proprios numeros das tabelas; o que
// aparece aqui e fato derivado (concentracao, maior caso, estreia no ano,
// comparacao com o pico), nunca juizo sobre o motivo ser bom ou ruim.
export type Leitura = {
  destaqueValor: string;
  destaqueRotulo: string;
  titulo: string;
  /** Trechos entre ** viram negrito na renderizacao. */
  frases: string[];
};

const SEM_MOTIVO = "Sem informação";

function pct(parte: number, total: number): number {
  return total > 0 ? (parte / total) * 100 : 0;
}

function pctTexto(parte: number, total: number): string {
  return `${pct(parte, total).toFixed(1).replace(".", ",")}%`;
}

function contratos(n: number): string {
  return n === 1 ? "1 contrato" : `${n} contratos`;
}

export function gerarLeitura(dados: {
  ano: string;
  mes: number;
  interno: FiltroInterno;
  baseValor: BaseValor;
  doMes: ContratoBase[];
  receitaMes: number;
  motivosPorReceita: FatiaValor[];
}): Leitura | null {
  const { ano, mes, interno, baseValor, doMes, receitaMes, motivosPorReceita } = dados;

  if (doMes.length === 0 || motivosPorReceita.length === 0) return null;

  // "Sem informação" nao e motivo. Ele pode liderar a tabela, mas nao serve de
  // manchete — o destaque vai para o maior motivo de fato, e o campo em branco
  // sai como ponto de atencao no fim do texto.
  const lider =
    motivosPorReceita.find((m) => m.rotulo !== SEM_MOTIVO) ?? motivosPorReceita[0];
  const frases: string[] = [];

  // 1. Quem puxa o mes.
  frases.push(
    `**${contratos(lider.contratos)}** e **${formatarMoedaExata(lider.receita)}** vêm de **${lider.rotulo}**, ${pctTexto(lider.receita, receitaMes)} da receita encerrada do mês.`
  );

  // 2. O maior caso isolado. Num mes de poucos contratos, um so pode
  // responder por metade do numero — e isso muda a leitura do total.
  const maior = doMes
    .map((c) => ({
      nome: c.nome,
      motivo: rotuloDe(c.motivoNaoRenovacao),
      receita: valorEncerrado(c, baseValor),
    }))
    .sort((a, b) => b.receita - a.receita)[0];

  if (maior && maior.receita > 0) {
    // Maior do ano dentro do mesmo motivo? Reforca o peso do caso.
    const doAnoMesmoMotivo = filtrarPorIntervalo("dataTerminoReal", ano, 1, 12, interno)
      .filter((c) => rotuloDe(c.motivoNaoRenovacao) === maior.motivo)
      .map((c) => valorEncerrado(c, baseValor));
    const recordeNoAno = doAnoMesmoMotivo.every((v) => v <= maior.receita);

    frases.push(
      `**${maior.nome} (${formatarMoedaExata(maior.receita)})** é o maior encerramento do mês${recordeNoAno && doAnoMesmoMotivo.length > 1 ? ` e o maior do ano em ${maior.motivo}` : ""}, sozinho ${pctTexto(maior.receita, receitaMes)} do total.`
    );
  }

  // 3. Estreia no ano: motivo que nao tinha aparecido ate o mes anterior.
  if (mes > 1) {
    const ateMesAnterior = filtrarPorIntervalo("dataTerminoReal", ano, 1, mes - 1, interno);
    const jaVistos = new Set(ateMesAnterior.map((c) => rotuloDe(c.motivoNaoRenovacao)));
    const estreia = motivosPorReceita.find(
      (m) => m.rotulo !== SEM_MOTIVO && !jaVistos.has(m.rotulo)
    );
    if (estreia) {
      const caso = doMes
        .filter((c) => rotuloDe(c.motivoNaoRenovacao) === estreia.rotulo)
        .sort((a, b) => valorEncerrado(b, baseValor) - valorEncerrado(a, baseValor))[0];
      frases.push(
        `**${estreia.rotulo}** aparece pela primeira vez no ano${caso ? ` (${caso.nome}, ${formatarMoedaExata(valorEncerrado(caso, baseValor))})` : ""} — vale acompanhar se vira tendência.`
      );
    }
  }

  // 4. Recuo em relacao ao pico do ano: so para o segundo motivo em diante, e
  // so quando o recuo e grande o bastante para nao ser oscilacao.
  const recuo = maiorRecuo({ ano, mes, interno, baseValor, motivosPorReceita, receitaMes });
  if (recuo) {
    frases.push(
      `**${recuo.motivo}** ficou em ${recuo.shareAtual.toFixed(1).replace(".", ",")}% da receita do mês, contra ${recuo.sharePico.toFixed(1).replace(".", ",")}% em **${recuo.mesPico}**, seu pico no ano.`
    );
  }

  // 5. Campo em branco distorce tudo acima. Tem prioridade sobre as frases
  // opcionais: no mes em que ele pesa, e a informacao mais importante do slide.
  const semMotivo = motivosPorReceita.find((m) => m.rotulo === SEM_MOTIVO);
  const atencao = semMotivo
    ? [
        `Atenção: **${contratos(semMotivo.contratos)}** (${pctTexto(semMotivo.receita, receitaMes)} da receita do mês) estão **sem motivo preenchido** na planilha.`,
      ]
    : [];

  return {
    destaqueValor: `${Math.round(pct(lider.receita, receitaMes))}%`,
    destaqueRotulo: lider.rotulo.toUpperCase(),
    titulo: `${lider.rotulo} concentra ${pctTexto(lider.receita, receitaMes)} da receita encerrada`,
    frases: [...frases.slice(0, 4 - atencao.length), ...atencao],
  };
}

const RECUO_MINIMO_EM_PONTOS = 12;

// Procura o motivo cuja participacao mais caiu em relacao ao melhor mes dele
// no ano. E o que responde "o que parou de acontecer", que o numero do mes
// sozinho nao conta.
function maiorRecuo(dados: {
  ano: string;
  mes: number;
  interno: FiltroInterno;
  baseValor: BaseValor;
  motivosPorReceita: FatiaValor[];
  receitaMes: number;
}) {
  const { ano, mes, interno, baseValor, motivosPorReceita, receitaMes } = dados;
  if (mes < 2) return null;

  let melhor: {
    motivo: string;
    shareAtual: number;
    sharePico: number;
    mesPico: string;
  } | null = null;

  for (const m of motivosPorReceita.slice(1)) {
    if (m.rotulo === SEM_MOTIVO) continue;
    const shareAtual = pct(m.receita, receitaMes);

    for (let anterior = 1; anterior < mes; anterior++) {
      const doMesAnterior = filtrarPorIntervalo(
        "dataTerminoReal",
        ano,
        anterior,
        anterior,
        interno
      );
      const totalAnterior = somarValorEncerrado(doMesAnterior, baseValor);
      if (totalAnterior <= 0) continue;

      const fatia = agruparComValor(doMesAnterior, (c) => c.motivoNaoRenovacao, baseValor).find(
        (f) => f.rotulo === m.rotulo
      );
      if (!fatia) continue;

      const sharePico = pct(fatia.receita, totalAnterior);
      if (
        sharePico - shareAtual >= RECUO_MINIMO_EM_PONTOS &&
        (!melhor || sharePico - shareAtual > melhor.sharePico - melhor.shareAtual)
      ) {
        melhor = { motivo: m.rotulo, shareAtual, sharePico, mesPico: MESES[anterior - 1] };
      }
    }
  }

  return melhor;
}
