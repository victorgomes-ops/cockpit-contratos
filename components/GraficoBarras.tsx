"use client";

import { useState } from "react";
import { SEM_INFORMACAO, type Fatia } from "@/lib/contratos-base";
import { useAlternarFiltro } from "@/lib/usar-filtro";

const LARANJA = "#FF5B00";
const ALTURA_PLOT = 132;
// Acima disto a coluna fica estreita demais para o nome completo e o texto
// quebraria no meio da palavra ("Eduar do"). O nome inteiro continua no title.
const LIMITE_NOME_INTEIRO = 6;

function encurtar(fatias: Fatia[]): string[] {
  const nomes = fatias.map((f) => {
    if (f.agregada || f.rotulo === SEM_INFORMACAO) return f.rotulo;
    const partes = f.rotulo.trim().split(/\s+/);
    return partes.length > 1 ? partes[0] : f.rotulo;
  });
  // Dois gerentes com o mesmo primeiro nome: desempata com a inicial seguinte.
  return nomes.map((nome, i) => {
    if (!nomes.some((outro, j) => j !== i && outro === nome)) return nome;
    const partes = fatias[i].rotulo.trim().split(/\s+/);
    return partes.length > 1 ? `${partes[0]} ${partes[1][0]}.` : nome;
  });
}

export function GraficoBarras({
  fatias,
  titulo,
  vazio,
  filtro,
  selecionado,
}: {
  fatias: Fatia[];
  titulo: string;
  vazio: string;
  /** Chave de query que o clique numa coluna liga/desliga. */
  filtro: string;
  selecionado: string;
}) {
  const [sobre, setSobre] = useState<string | null>(null);
  const alternar = useAlternarFiltro();

  const total = fatias.reduce((t, f) => t + f.quantidade, 0);
  const maior = Math.max(...fatias.map((f) => f.quantidade), 1);
  const rotulos =
    fatias.length > LIMITE_NOME_INTEIRO ? encurtar(fatias) : fatias.map((f) => f.rotulo);

  // Serie unica: uma cor so. O que diferencia as colunas e a altura, nao a cor.
  // O piso de 0,4 e para o nome e o numero da coluna apagada continuarem
  // legiveis — sem isso nao da para saber de quem e a barra que voce quer clicar.
  function opacidade(rotulo: string): number {
    if (selecionado) return rotulo === selecionado ? 1 : 0.4;
    if (sobre) return rotulo === sobre ? 1 : 0.55;
    return 1;
  }

  return (
    <div className="rounded-md border border-pwr-dark-blue/10 bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[12px] font-semibold text-pwr-dark-blue">{titulo}</h3>
        <span className="text-[10px] text-pwr-blue/45">{total} projetos</span>
      </div>

      {fatias.length === 0 ? (
        <p className="py-10 text-center text-[11px] text-pwr-blue/40">{vazio}</p>
      ) : (
        <>
          {/* flex-1 com teto de largura: com 11 gerentes as colunas encolhem
              para caber, com um gerente so a coluna nao vira um retangulo
              ocupando o grafico inteiro. */}
          <div
            className="mt-3 flex items-end justify-center gap-1.5"
            style={{ height: ALTURA_PLOT }}
          >
            {fatias.map((f) => {
              const altura = Math.max((f.quantidade / maior) * 100, 2);
              const ativo = selecionado === f.rotulo;
              const pct = total > 0 ? (f.quantidade / total) * 100 : 0;
              return (
                <button
                  key={f.rotulo}
                  type="button"
                  disabled={f.agregada}
                  aria-pressed={ativo}
                  onClick={() => alternar(filtro, f.rotulo)}
                  onMouseEnter={() => setSobre(f.rotulo)}
                  onMouseLeave={() => setSobre(null)}
                  onFocus={() => setSobre(f.rotulo)}
                  onBlur={() => setSobre(null)}
                  title={
                    f.agregada
                      ? `${f.rotulo}: ${f.quantidade} projetos (soma de varias categorias, nao filtravel)`
                      : `${f.rotulo}: ${f.quantidade} de ${total} (${pct.toFixed(1).replace(".", ",")}%) — clique para ${ativo ? "limpar o filtro" : "filtrar"}`
                  }
                  className="flex h-full max-w-20 flex-1 flex-col justify-end gap-1 rounded-t-[4px] transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pwr-orange/60 enabled:cursor-pointer disabled:cursor-default"
                  style={{ opacity: opacidade(f.rotulo) }}
                >
                  <span className="text-[10px] font-semibold text-pwr-dark-blue tabular-nums">
                    {f.quantidade}
                  </span>
                  <span
                    className="w-full rounded-t-[4px] transition-[height] duration-200"
                    style={{ height: `${altura}%`, backgroundColor: LARANJA }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-1.5 border-t border-pwr-dark-blue/15 pt-1.5">
            {fatias.map((f, i) => (
              <span
                key={f.rotulo}
                title={f.rotulo}
                className="line-clamp-2 max-w-20 flex-1 text-center text-[9px] leading-tight transition-opacity duration-200"
                style={{
                  opacity: opacidade(f.rotulo),
                  color: selecionado === f.rotulo ? LARANJA : undefined,
                }}
              >
                <span className={selecionado === f.rotulo ? "font-semibold" : "text-pwr-blue/65"}>
                  {rotulos[i]}
                </span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
