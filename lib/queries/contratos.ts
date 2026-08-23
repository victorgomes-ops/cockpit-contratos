import { supabase } from "@/lib/supabase";

export type ContratoResumo = {
  nome: string;
  status: string;
  cliente: string;
  interno: boolean;
  unidade: string;
  gerenteProjeto: string;
  terminoVendido: string;
};

type BaseDadosContratosPayload = {
  total: number;
  gerado: string;
  contratos: ContratoResumo[];
};

export type ContratosResumoResult = {
  contratos: ContratoResumo[];
  total: number;
  atualizadoEm: string;
};

// Lê o blob resumido (7 campos) já sincronizado por outro processo em base_dados.
// Não inclui Data de Renovação, Aceite do Cliente nem valores — isso depende da
// ingestão completa da planilha Contratos.xlsx, ainda pendente (ver docs/DECISIONS.md).
export async function getContratosResumo(): Promise<ContratosResumoResult> {
  const { data, error } = await supabase
    .from("base_dados")
    .select("dados, atualizado_em")
    .eq("tipo", "contratos")
    .single();

  if (error) {
    throw new Error(`Falha ao ler contratos do Supabase: ${error.message}`);
  }

  const payload = data.dados as BaseDadosContratosPayload;

  return {
    contratos: payload.contratos ?? [],
    total: payload.total ?? payload.contratos?.length ?? 0,
    atualizadoEm: data.atualizado_em as string,
  };
}

export function contarPor<T>(itens: T[], chave: (item: T) => string): Record<string, number> {
  return itens.reduce<Record<string, number>>((acc, item) => {
    const k = chave(item) || "Sem informação";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
}
