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
  tipoDuracao: string;
  aceiteCliente: string;
  valorTotal: string;
  receitaRecorrente: string;
  motivoNaoRenovacao: string;
  servicos: string;
};

export type BaseContratos = {
  gerado: string;
  origem: string;
  total: number;
  contratos: ContratoBase[];
};

export type CampoData = "dataEntrada" | "dataRenovacao" | "dataTerminoVendido";
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
