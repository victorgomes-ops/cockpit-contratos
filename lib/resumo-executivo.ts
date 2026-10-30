import { type FatiaValor, formatarMoeda } from "./contratos-base";

export type Paragrafo = { titulo: string; texto: string };

export type CruzamentoMotivoGerente = {
  motivo: string;
  gerente: string;
  contratos: number;
  receita: number;
};

// Limiares de exibicao, nao regras de negocio. Servem so para decidir o que
// merece virar frase: abaixo disto o numero e ruido e polui o resumo.
const MIN_CASOS_PARA_DESTAQUE = 2;
const CONCENTRACAO_UM_CONTRATO = 30; // % da receita do mes num unico contrato
const CONCENTRACAO_UM_GERENTE = 50; // % dos encerramentos num unico gerente

function pct(parte: number, total: number): string {
  if (total <= 0) return "0,0%";
  return `${((parte / total) * 100).toFixed(1).replace(".", ",")}%`;
}

function pontos(n: number): string {
  return `${Math.abs(n).toFixed(1).replace(".", ",")} ponto${Math.abs(n) >= 2 ? "s" : ""}`;
}

function contratos(n: number): string {
  return n === 1 ? "1 contrato" : `${n} contratos`;
}

function verbo(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

// Rotulo que agruparPor/rotuloDe dao a quem esta com o campo em branco. Nao e
// um motivo de verdade, entao as frases precisam trata-lo a parte.
const SEM_MOTIVO = "Sem informação";

export function gerarResumoExecutivo(dados: {
  mesRotulo: string;
  acumuladoRotulo: string;
  mesesNoAcumulado: number;
  /** Falso quando o acumulado termina antes do mes de referencia (ex.: outubro
   *  contra jan-set). Ai o mes nao e parte do total e a frase vira comparacao,
   *  nao participacao — senao o percentual passaria de 100% sem explicacao. */
  mesDentroDoAcumulado: boolean;
  motivosMes: FatiaValor[];
  motivosAcumulado: FatiaValor[];
  gerentesMes: FatiaValor[];
  cruzamento: CruzamentoMotivoGerente[];
  totalMes: { contratos: number; receita: number };
  totalAcumulado: { contratos: number; receita: number };
  maiorContrato: { nome: string; receita: number } | null;
  semValorRegistrado: number;
}): Paragrafo[] {
  const {
    mesRotulo,
    acumuladoRotulo,
    mesesNoAcumulado,
    mesDentroDoAcumulado,
    motivosMes,
    motivosAcumulado,
    gerentesMes,
    cruzamento,
    totalMes,
    totalAcumulado,
    maiorContrato,
    semValorRegistrado,
  } = dados;

  if (totalMes.contratos === 0) {
    return [
      {
        titulo: "Sem movimento",
        texto: `Nenhum contrato com término real em ${mesRotulo}. No acumulado ${acumuladoRotulo} ${verbo(totalAcumulado.contratos, "é", "são")} ${contratos(totalAcumulado.contratos)} e ${formatarMoeda(totalAcumulado.receita)} de receita encerrada.`,
      },
    ];
  }

  const resumo: Paragrafo[] = [];

  // 1. Enquadramento: o numero do mes so significa alguma coisa comparado a
  // alguma coisa. A referencia aqui e a media mensal do proprio acumulado.
  const media = mesesNoAcumulado > 0 ? totalAcumulado.contratos / mesesNoAcumulado : 0;
  const desvio = media > 0 ? ((totalMes.contratos - media) / media) * 100 : 0;
  const comparacao =
    mesesNoAcumulado > 1 && media > 0
      ? Math.abs(desvio) < 10
        ? ` A média do período é de ${media.toFixed(1).replace(".", ",")} contratos por mês, então o mês ficou em linha com o ritmo do ano.`
        : ` A média do período é de ${media.toFixed(1).replace(".", ",")} contratos por mês, então o mês ficou ${Math.abs(desvio).toFixed(0)}% ${desvio > 0 ? "acima" : "abaixo"} do ritmo do ano.`
      : "";

  const contraAcumulado = mesDentroDoAcumulado
    ? `Isso é ${pct(totalMes.contratos, totalAcumulado.contratos)} dos encerramentos e ${pct(totalMes.receita, totalAcumulado.receita)} da receita encerrada no acumulado ${acumuladoRotulo}.`
    : `O acumulado ${acumuladoRotulo}, que não inclui este mês, soma ${contratos(totalAcumulado.contratos)} e ${formatarMoeda(totalAcumulado.receita)} — o mês equivale a ${pct(totalMes.contratos, totalAcumulado.contratos)} daquele volume.`;

  resumo.push({
    titulo: "Panorama do mês",
    texto:
      `${contratos(totalMes.contratos)} ${verbo(totalMes.contratos, "encerrado", "encerrados")} em ${mesRotulo}, somando ${formatarMoeda(totalMes.receita)} de receita encerrada. ` +
      contraAcumulado +
      comparacao,
  });

  // 2. Incidencia. Se a maior fatia e o campo em branco, dizer "Sem informacao
  // lidera" nao informa nada — o util e nomear tambem o maior motivo de fato.
  const principal = motivosMes[0];
  const registrados = motivosMes.filter((m) => m.rotulo !== SEM_MOTIVO);
  const principalRegistrado = registrados[0];

  const quantosRegistrados = registrados.length;
  const plurMotivos = `${quantosRegistrados} motivo${quantosRegistrados > 1 ? "s" : ""} registrado${quantosRegistrados > 1 ? "s" : ""}`;

  let textoIncidencia: string;
  if (principal.rotulo === SEM_MOTIVO) {
    textoIncidencia = `A maior fatia do mês está sem motivo preenchido: ${contratos(principal.contratos)} de ${totalMes.contratos} (${pct(principal.contratos, totalMes.contratos)}).`;
    if (principalRegistrado) {
      textoIncidencia += ` Entre os ${totalMes.contratos - principal.contratos} com motivo registrado, ${principalRegistrado.rotulo} lidera com ${contratos(principalRegistrado.contratos)}, num mês com ${plurMotivos}.`;
    }
  } else {
    textoIncidencia = `${principal.rotulo} lidera em incidência, com ${contratos(principal.contratos)} de ${totalMes.contratos} (${pct(principal.contratos, totalMes.contratos)}).`;
    if (motivosMes.length >= 2) {
      const doisPrimeiros = principal.contratos + motivosMes[1].contratos;
      textoIncidencia += ` Somado a ${motivosMes[1].rotulo}, os dois primeiros respondem por ${pct(doisPrimeiros, totalMes.contratos)} dos casos, num mês com ${plurMotivos}.`;
    } else {
      textoIncidencia += " Todos os encerramentos do mês caem no mesmo motivo.";
    }
  }
  resumo.push({ titulo: "Onde está a incidência", texto: textoIncidencia });

  // 3. Impacto financeiro. O motivo que mais aparece nem sempre e o que mais
  // custa — quando difere, e a informacao mais util do resumo.
  const porReceita = [...motivosMes].sort((a, b) => b.receita - a.receita);
  const liderReceita = porReceita[0];
  const ticketMes = totalMes.receita / totalMes.contratos;
  const ticketLider = liderReceita.contratos > 0 ? liderReceita.receita / liderReceita.contratos : 0;

  const semMotivoLidera = liderReceita.rotulo === SEM_MOTIVO;
  const nomeLider = semMotivoLidera ? "os contratos sem motivo preenchido" : liderReceita.rotulo;

  let textoFinanceiro: string;
  if (liderReceita.rotulo === principal.rotulo) {
    textoFinanceiro = semMotivoLidera
      ? `Os contratos sem motivo preenchido também concentram o maior valor: ${formatarMoeda(liderReceita.receita)}, ${pct(liderReceita.receita, totalMes.receita)} da receita encerrada do mês.`
      : `O motivo mais frequente é também o de maior peso financeiro: ${formatarMoeda(liderReceita.receita)}, ${pct(liderReceita.receita, totalMes.receita)} da receita encerrada do mês.`;
  } else {
    textoFinanceiro =
      `O maior impacto financeiro não vem do motivo mais frequente. ${nomeLider[0].toUpperCase()}${nomeLider.slice(1)} concentra ${formatarMoeda(liderReceita.receita)} (${pct(liderReceita.receita, totalMes.receita)} da receita encerrada) com ${contratos(liderReceita.contratos)}, ` +
      `enquanto ${principal.rotulo}, com ${contratos(principal.contratos)}, pesa ${pct(principal.receita, totalMes.receita)}.`;
  }
  if (ticketMes > 0 && ticketLider > 0) {
    textoFinanceiro += ` O ticket médio ${semMotivoLidera ? "desse grupo" : `de ${liderReceita.rotulo}`} é de ${formatarMoeda(ticketLider)}, contra ${formatarMoeda(ticketMes)} na média do mês.`;
  }
  const liderRegistrado = porReceita.find((m) => m.rotulo !== SEM_MOTIVO);
  if (semMotivoLidera && liderRegistrado) {
    textoFinanceiro += ` Entre os motivos registrados, o maior peso é de ${liderRegistrado.rotulo}: ${formatarMoeda(liderRegistrado.receita)} (${pct(liderRegistrado.receita, totalMes.receita)}).`;
  }
  resumo.push({ titulo: "Onde está o dinheiro", texto: textoFinanceiro });

  // 4. Descolamento em relacao ao acumulado: qual motivo pesou mais neste mes
  // do que vem pesando no periodo.
  if (mesesNoAcumulado > 1 && totalAcumulado.contratos > 0) {
    const acumuladoPor = new Map(motivosAcumulado.map((m) => [m.rotulo, m]));
    const descolamentos = motivosMes
      // Campo em branco fora: o salto dele ja e tratado em Pontos de atencao,
      // e aqui o que interessa e qual motivo de verdade se mexeu.
      .filter((m) => m.rotulo !== SEM_MOTIVO && m.contratos >= MIN_CASOS_PARA_DESTAQUE)
      .map((m) => {
        const noAcumulado = acumuladoPor.get(m.rotulo);
        const shareMes = (m.contratos / totalMes.contratos) * 100;
        const shareAcum = noAcumulado
          ? (noAcumulado.contratos / totalAcumulado.contratos) * 100
          : 0;
        return {
          motivo: m.rotulo,
          contratos: m.contratos,
          shareMes,
          shareAcum,
          delta: shareMes - shareAcum,
          noAcumulado,
        };
      })
      .sort((a, b) => b.delta - a.delta);

    // Ordenado do maior para o menor delta, entao o topo e o descolamento mais
    // positivo; se ate ele for negativo, o mes inteiro veio abaixo do periodo.
    const topo = descolamentos[0];
    if (topo) {
      const numero = (n: number) => n.toFixed(1).replace(".", ",");
      let texto: string;
      if (!topo.noAcumulado) {
        texto = `${topo.motivo} aparece em ${contratos(topo.contratos)} neste mês e não tem nenhum registro no acumulado ${acumuladoRotulo}.`;
      } else if (Math.abs(topo.delta) <= 1) {
        texto = `Nenhum motivo se descolou do acumulado: ${topo.motivo}, o de maior peso no mês, ficou em ${numero(topo.shareMes)}% contra ${numero(topo.shareAcum)}% no acumulado ${acumuladoRotulo}.`;
      } else {
        texto = `${topo.motivo} respondeu por ${numero(topo.shareMes)}% dos encerramentos do mês contra ${numero(topo.shareAcum)}% no acumulado ${acumuladoRotulo} — ${pontos(topo.delta)} ${topo.delta > 0 ? "acima" : "abaixo"}, o maior descolamento do mês.`;
      }
      resumo.push({ titulo: "O que mudou em relação ao acumulado", texto });
    }
  }

  // 5. Concentracao por gerente.
  if (gerentesMes.length > 0) {
    const topGerente = gerentesMes[0];
    let textoGerente = `${contratos(topGerente.contratos)} de ${totalMes.contratos} (${pct(topGerente.contratos, totalMes.contratos)}) ${verbo(topGerente.contratos, "está", "estão")} sob ${topGerente.rotulo}, somando ${formatarMoeda(topGerente.receita)}. Os encerramentos do mês se distribuem entre ${gerentesMes.length} gerente${gerentesMes.length > 1 ? "s" : ""}.`;

    const parForte = cruzamento
      .filter((c) => c.contratos >= MIN_CASOS_PARA_DESTAQUE)
      .sort((a, b) => b.contratos - a.contratos || b.receita - a.receita)[0];
    if (parForte) {
      textoGerente += ` A combinação mais recorrente é ${parForte.motivo} com ${parForte.gerente}: ${contratos(parForte.contratos)} e ${formatarMoeda(parForte.receita)}.`;
    }
    resumo.push({ titulo: "Concentração por gerente", texto: textoGerente });
  }

  // 6. Pontos de atencao: o que pode estar distorcendo a leitura acima.
  const atencao: string[] = [];

  const semMotivo = motivosMes.find((m) => m.rotulo === SEM_MOTIVO);
  if (semMotivo) {
    atencao.push(
      `${contratos(semMotivo.contratos)} (${pct(semMotivo.contratos, totalMes.contratos)} dos casos, ${formatarMoeda(semMotivo.receita)}) ${verbo(semMotivo.contratos, "está", "estão")} sem motivo preenchido na planilha — enquanto não ${verbo(semMotivo.contratos, "for", "forem")}, a distribuição acima fica parcial.`
    );
  }

  if (
    maiorContrato &&
    totalMes.receita > 0 &&
    (maiorContrato.receita / totalMes.receita) * 100 >= CONCENTRACAO_UM_CONTRATO &&
    totalMes.contratos > 1
  ) {
    atencao.push(
      `Um único contrato (${maiorContrato.nome}) responde por ${pct(maiorContrato.receita, totalMes.receita)} da receita encerrada do mês, então o total é sensível a esse caso isolado.`
    );
  }

  if (
    gerentesMes.length > 1 &&
    (gerentesMes[0].contratos / totalMes.contratos) * 100 >= CONCENTRACAO_UM_GERENTE
  ) {
    atencao.push(
      `${gerentesMes[0].rotulo} concentra metade ou mais dos encerramentos do mês (${pct(gerentesMes[0].contratos, totalMes.contratos)}).`
    );
  }

  if (semValorRegistrado > 0) {
    atencao.push(
      `${contratos(semValorRegistrado)} ${verbo(semValorRegistrado, "está", "estão")} com o valor zerado na coluna escolhida, então ${verbo(semValorRegistrado, "entra", "entram")} na contagem mas não na receita.`
    );
  }

  if (atencao.length > 0) {
    resumo.push({ titulo: "Pontos de atenção", texto: atencao.join(" ") });
  }

  return resumo;
}
