import dadosBrutos from "@/data/contratos.json";

export type ContratoBase = {
  nome: string;
  cliente: string;
  status: string;
  interno: boolean;
  unidade: string;
  gerenteProjeto: string;
  gerenteVenda: string;
  scrumMaster: string;
  parcelasVendidas: string;
  duracaoVendida: string;
  dataEntrada: string;
  dataRenovacao: string;
  dataTerminoVendido: string;
  dataTerminoReal: string;
  tipoDuracao: string;
  aceiteCliente: string;
  valorTotal: string;
  parcelaFechada: string;
  receitaRecorrente: string;
  motivoNaoRenovacao: string;
  motivoDetalhe: string;
  servicos: string;
};

export type BaseContratos = {
  gerado: string;
  origem: string;
  total: number;
  contratos: ContratoBase[];
};

export type CampoData =
  | "dataEntrada"
  | "dataRenovacao"
  | "dataTerminoVendido"
  | "dataTerminoReal";
export type FiltroInterno = "todos" | "sim" | "nao";

const base = dadosBrutos as BaseContratos;

export function getBaseContratos(): BaseContratos {
  return base;
}

// "25/05/2020" -> "2020-05". Qualquer outro formato retorna null.
export function mesAnoDe(data: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data ?? "");
  return m ? `${m[3]}-${m[2]}` : null;
}

function diaDe(data: string): number {
  const m = /^(\d{2})\//.exec(data ?? "");
  return m ? Number(m[1]) : 0;
}

// A planilha mistura dois formatos: "$1,234.56" (maioria) e "R$ 1.234,56".
export function valorNumerico(valor: string): number {
  const texto = (valor ?? "").trim();
  if (!texto) return 0;
  const limpo = texto.startsWith("R$")
    ? texto.replace(/[R$\s.]/g, "").replace(",", ".")
    : texto.replace(/[$,\s]/g, "");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function mesAtual(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const ano = partes.find((p) => p.type === "year")?.value ?? "";
  const mes = partes.find((p) => p.type === "month")?.value ?? "";
  return `${ano}-${mes}`;
}

export function rotuloMes(mes: string): string {
  const [ano, m] = mes.split("-");
  const data = new Date(Number(ano), Number(m) - 1, 1);
  const texto = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function normalizarMes(valor: string | undefined): string {
  return valor && /^\d{4}-\d{2}$/.test(valor) ? valor : mesAtual();
}

export function normalizarInterno(valor: string | undefined): FiltroInterno {
  return valor === "sim" || valor === "nao" ? valor : "todos";
}

export function normalizarStatus(valor: string | undefined): string {
  return valor && valor !== "todos" ? valor : "todos";
}

export function statusDisponiveis(): string[] {
  const unicos = new Set(
    base.contratos.map((c) => c.status).filter((s) => s.trim() !== "")
  );
  return Array.from(unicos).sort();
}

export function filtrarPorMes(
  campo: CampoData,
  mes: string,
  interno: FiltroInterno,
  status: string = "todos"
): ContratoBase[] {
  return base.contratos
    .filter((c) => mesAnoDe(c[campo]) === mes)
    .filter((c) => (interno === "todos" ? true : interno === "sim" ? c.interno : !c.interno))
    .filter((c) => (status === "todos" ? true : c.status === status))
    .sort((a, b) => diaDe(a[campo]) - diaDe(b[campo]));
}

function partesData(data: string): { dia: number; mes: number; ano: number } | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data ?? "");
  return m ? { dia: Number(m[1]), mes: Number(m[2]), ano: Number(m[3]) } : null;
}

// Diferenca em meses de calendario. Usada para derivar quantas parcelas uma
// renovacao acrescentou, ja que a planilha nao guarda esse numero: ela so
// atualiza o acumulado em Parcelas Vendidas.
export function mesesEntre(inicio: string, fim: string): number {
  const a = partesData(inicio);
  const b = partesData(fim);
  if (!a || !b) return 0;
  const n = (b.ano - a.ano) * 12 + (b.mes - a.mes);
  return n > 0 ? n : 0;
}

export function parcelasRenovadas(contrato: ContratoBase): number {
  return mesesEntre(contrato.dataRenovacao, contrato.dataTerminoVendido);
}

// Valor por parcela = Valor Total / Duracao Vendida. Os dois sao acumulados da
// vida inteira do contrato, entao a razao entre eles e um valor mensal valido.
export function valorDaParcela(contrato: ContratoBase): number {
  const duracao = Number((contrato.duracaoVendida ?? "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(duracao) || duracao <= 0) return 0;
  return valorNumerico(contrato.valorTotal) / duracao;
}

export function valorRenovado(contrato: ContratoBase): number {
  return valorDaParcela(contrato) * parcelasRenovadas(contrato);
}

// A planilha exporta campos de data vazios como 31/12/1899 (dia zero do Excel),
// e em alguns casos como ano 0001. Essas datas significam "nao preenchido".
const ANO_MINIMO = 2000;

export function anoDe(data: string): string | null {
  const m = /^\d{2}\/\d{2}\/(\d{4})$/.exec(data ?? "");
  if (!m) return null;
  return Number(m[1]) >= ANO_MINIMO ? m[1] : null;
}

export function contarSemDataValida(campo: CampoData): number {
  return base.contratos.filter((c) => {
    const bruto = c[campo] ?? "";
    return bruto !== "" && anoDe(bruto) === null;
  }).length;
}

// Anos com encerramento registrado, do mais recente para o mais antigo.
export function anosDisponiveis(campo: CampoData): string[] {
  const anos = new Set<string>();
  for (const c of base.contratos) {
    const ano = anoDe(c[campo]);
    if (ano) anos.add(ano);
  }
  return Array.from(anos).sort((a, b) => Number(b) - Number(a));
}

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// mes = "todos" traz o ano inteiro.
export function filtrarPorPeriodo(
  campo: CampoData,
  ano: string,
  mes: string,
  interno: FiltroInterno
): ContratoBase[] {
  return base.contratos
    .filter((c) => {
      // anoDe() ja descarta as datas-sentinela do Excel.
      if (anoDe(c[campo]) !== ano) return false;
      if (mes === "todos") return true;
      return mesAnoDe(c[campo]) === `${ano}-${mes}`;
    })
    .filter((c) => (interno === "todos" ? true : interno === "sim" ? c.interno : !c.interno))
    .sort((a, b) => {
      const da = mesAnoDe(a[campo]) ?? "";
      const db = mesAnoDe(b[campo]) ?? "";
      if (da !== db) return da.localeCompare(db);
      return diaDe(a[campo]) - diaDe(b[campo]);
    });
}

// agregada marca a fatia "Outros", que junta varias categorias e por isso nao
// pode virar filtro.
export type Fatia = { rotulo: string; quantidade: number; agregada?: boolean };

export function agruparPor(
  contratos: ContratoBase[],
  chave: (c: ContratoBase) => string
): Fatia[] {
  const mapa = new Map<string, number>();
  for (const c of contratos) {
    const k = chave(c).trim() || "Sem informação";
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return Array.from(mapa, ([rotulo, quantidade]) => ({ rotulo, quantidade })).sort(
    (a, b) => b.quantidade - a.quantidade
  );
}

// Mantem os maiores e agrupa a cauda em "Outros", para a barra nao virar
// uma parede de 15 linhas no filtro de ano inteiro.
export function limitarComOutros(fatias: Fatia[], limite: number): Fatia[] {
  if (fatias.length <= limite) return fatias;
  const principais = fatias.slice(0, limite);
  const resto = fatias.slice(limite).reduce((t, f) => t + f.quantidade, 0);
  return resto > 0
    ? [
        ...principais,
        { rotulo: `Outros (${fatias.length - limite})`, quantidade: resto, agregada: true },
      ]
    : principais;
}

// O rotulo que agruparPor da a quem nao tem o campo preenchido. Os filtros
// clicaveis precisam reproduzir essa mesma regra para casar com a fatia.
export const SEM_INFORMACAO = "Sem informação";

export function rotuloDe(valor: string): string {
  return valor.trim() || SEM_INFORMACAO;
}

// Periodo imediatamente anterior ao selecionado, para a comparacao dos KPIs.
// "todos" compara ano contra ano; um mes compara contra o mes anterior.
export function periodoAnterior(
  ano: string,
  mes: string
): { ano: string; mes: string; rotulo: string } {
  if (mes === "todos") {
    const anterior = String(Number(ano) - 1);
    return { ano: anterior, mes: "todos", rotulo: anterior };
  }
  const n = Number(mes);
  if (n === 1) {
    const anterior = String(Number(ano) - 1);
    return { ano: anterior, mes: "12", rotulo: `dez/${anterior}` };
  }
  // Mesmo ano, entao o nome do mes basta e o card nao precisa truncar.
  return {
    ano,
    mes: String(n - 1).padStart(2, "0"),
    rotulo: MESES[n - 2].toLowerCase(),
  };
}

// Tempo de vida do contrato: da entrada ate o termino real. Contratos sem uma
// das duas datas validas ficam de fora, por isso devolvemos quantos entraram.
export function duracaoMediaMeses(contratos: ContratoBase[]): {
  media: number;
  considerados: number;
} {
  const duracoes = contratos
    .filter((c) => anoDe(c.dataEntrada) !== null && anoDe(c.dataTerminoReal) !== null)
    .map((c) => mesesEntre(c.dataEntrada, c.dataTerminoReal));
  if (duracoes.length === 0) return { media: 0, considerados: 0 };
  return {
    media: duracoes.reduce((t, n) => t + n, 0) / duracoes.length,
    considerados: duracoes.length,
  };
}

// Doze posicoes, janeiro a dezembro. Espera uma lista ja restrita a um ano.
export function contagemPorMes(contratos: ContratoBase[], campo: CampoData): number[] {
  const meses = new Array<number>(12).fill(0);
  for (const c of contratos) {
    const m = mesAnoDe(c[campo]);
    if (!m) continue;
    const i = Number(m.slice(5, 7)) - 1;
    if (i >= 0 && i < 12) meses[i] += 1;
  }
  return meses;
}

// Parcela Fechada = valor da parcela acordada de cada projeto.
export function somarParcelaFechada(contratos: ContratoBase[]): number {
  return contratos.reduce((total, c) => total + valorNumerico(c.parcelaFechada), 0);
}

export type ResumoMes = {
  mes: string;
  renovacoes: number;
  parcelas: number;
  valor: number;
};

export function resumoDoMes(
  mes: string,
  interno: FiltroInterno = "todos",
  status: string = "todos"
): ResumoMes {
  const renovados = filtrarPorMes("dataRenovacao", mes, interno, status);
  return {
    mes,
    renovacoes: renovados.length,
    parcelas: renovados.reduce((t, c) => t + parcelasRenovadas(c), 0),
    valor: renovados.reduce((t, c) => t + valorRenovado(c), 0),
  };
}

export function mesAnterior(mes: string, passos: number): string {
  const [ano, m] = mes.split("-").map(Number);
  const data = new Date(ano, m - 1 - passos, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function serieMensal(
  mesFinal: string,
  quantidade: number,
  interno: FiltroInterno = "todos",
  status: string = "todos"
): ResumoMes[] {
  return Array.from({ length: quantidade }, (_, i) =>
    resumoDoMes(mesAnterior(mesFinal, i), interno, status)
  );
}

export type IndicadoresRenovacao = {
  aRenovar: number;
  renovados: number;
  potencial: number;
  taxaQuantidade: number | null;
  receitaARenovar: number;
  receitaRenovada: number;
  receitaPotencial: number;
  taxaReceita: number | null;
};

// Quando um contrato e renovado, a planilha empurra o Data Termino Vendido para
// a frente, entao ele sai da lista de "a renovar". Os dois grupos nunca se
// cruzam: o potencial do mes e a soma dos dois.
export function calcularIndicadores(
  aRenovar: ContratoBase[],
  renovados: ContratoBase[]
): IndicadoresRenovacao {
  const potencial = aRenovar.length + renovados.length;
  const somaReceita = (lista: ContratoBase[]) =>
    lista.reduce((total, c) => total + valorNumerico(c.receitaRecorrente), 0);

  const receitaARenovar = somaReceita(aRenovar);
  const receitaRenovada = somaReceita(renovados);
  const receitaPotencial = receitaARenovar + receitaRenovada;

  return {
    aRenovar: aRenovar.length,
    renovados: renovados.length,
    potencial,
    taxaQuantidade: potencial > 0 ? (renovados.length / potencial) * 100 : null,
    receitaARenovar,
    receitaRenovada,
    receitaPotencial,
    taxaReceita: receitaPotencial > 0 ? (receitaRenovada / receitaPotencial) * 100 : null,
  };
}
