import dadosBrutos from "@/data/contratos.json";

export type ContratoBase = {
  nome: string;
  cliente: string;
  status: string;
  interno: boolean;
  unidade: string;
  gerenteProjeto: string;
  gerenteVenda: string;
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

export function filtrarPorMes(
  campo: CampoData,
  mes: string,
  interno: FiltroInterno
): ContratoBase[] {
  return base.contratos
    .filter((c) => mesAnoDe(c[campo]) === mes)
    .filter((c) => (interno === "todos" ? true : interno === "sim" ? c.interno : !c.interno))
    .sort((a, b) => diaDe(a[campo]) - diaDe(b[campo]));
}
