"use client";

import { useEffect, useRef, useState } from "react";

type Estado = "parado" | "copiado" | "erro";

// Tres caminhos, do melhor para o que sempre funciona. O primeiro e barrado em
// alguns contextos (permissao negada, janela sem ativacao do usuario), e nesses
// casos a selecao + execCommand ainda entrega HTML para o PowerPoint.
async function copiar(html: string | undefined, texto: string): Promise<boolean> {
  if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([texto], { type: "text/plain" }),
        }),
      ]);
      return true;
    } catch (erro) {
      console.warn("clipboard.write indisponível, tentando execCommand", erro);
    }
  }

  if (html) {
    try {
      const suporte = document.createElement("div");
      suporte.innerHTML = html;
      suporte.setAttribute("style", "position:fixed;left:-9999px;top:0;");
      document.body.appendChild(suporte);

      const intervalo = document.createRange();
      intervalo.selectNodeContents(suporte);
      const selecao = window.getSelection();
      selecao?.removeAllRanges();
      selecao?.addRange(intervalo);

      const ok = document.execCommand("copy");
      selecao?.removeAllRanges();
      suporte.remove();
      if (ok) return true;
    } catch (erro) {
      console.warn("execCommand copy falhou", erro);
    }
  }

  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (erro) {
    console.warn("writeText falhou", erro);
    return false;
  }
}

export function BotaoCopiar({
  html,
  texto,
  rotulo = "Copiar tabela",
}: {
  /** Ausente copia só texto puro. Presente, o PowerPoint cola como tabela. */
  html?: string;
  texto: string;
  rotulo?: string;
}) {
  const [estado, setEstado] = useState<Estado>("parado");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  async function aoClicar() {
    setEstado((await copiar(html, texto)) ? "copiado" : "erro");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("parado"), 2500);
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="nao-imprimir cursor-pointer rounded border border-pwr-dark-blue/15 bg-white px-2 py-1 text-[11px] font-medium text-pwr-blue/70 transition-colors hover:border-pwr-orange/50 hover:text-pwr-orange"
    >
      {estado === "copiado" ? "Copiado" : estado === "erro" ? "Não deu — use Ctrl+C" : rotulo}
    </button>
  );
}
