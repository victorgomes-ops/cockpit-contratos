"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Clicar numa fatia de grafico liga o filtro; clicar na mesma fatia desliga.
// scroll: false porque o clique acontece no meio da pagina e saltar para o topo
// faz perder de vista o que acabou de ser filtrado.
export function useAlternarFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function alternar(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(chave) === valor) {
      params.delete(chave);
    } else {
      params.set(chave, valor);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
}

export function useLimparFiltros(chaves: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function limpar() {
    const params = new URLSearchParams(searchParams.toString());
    for (const chave of chaves) params.delete(chave);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
}
