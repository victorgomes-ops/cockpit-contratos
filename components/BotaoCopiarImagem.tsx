"use client";

import { useEffect, useRef, useState } from "react";

type Estado = "parado" | "gerando" | "copiado" | "baixado" | "erro";

function paraBase64(buffer: ArrayBuffer): string {
  // Em blocos: espalhar 100 mil bytes de uma vez estoura a pilha de chamadas.
  const bytes = new Uint8Array(buffer);
  const passo = 0x8000;
  let binario = "";
  for (let i = 0; i < bytes.length; i += passo) {
    binario += String.fromCharCode(...bytes.subarray(i, i + passo));
  }
  return btoa(binario);
}

// Guarda a promessa, nao o resultado: clicar enquanto o pre-aquecimento ainda
// roda tem que esperar o mesmo trabalho, nao disparar um segundo em paralelo
// — duas varreduras concorrentes brigam pelas mesmas dezenas de requisicoes
// e a geracao trava.
let cacheFontes: Promise<string> | null = null;

function cssDasFontes(): Promise<string> {
  if (!cacheFontes) cacheFontes = construirCssDasFontes();
  return cacheFontes;
}

// A biblioteca sabe descobrir as fontes sozinha, mas para isso varre todas as
// folhas de estilo da pagina e trava — em desenvolvimento o CSS do Tailwind e
// enorme. Como o slide usa uma fonte so, montamos o @font-face da Montserrat
// e entregamos pronto, o que tambem deixa a geracao bem mais rapida.
async function construirCssDasFontes(): Promise<string> {
  // A url dentro do @font-face e relativa a folha de estilo ("../media/x.woff2"),
  // nao a pagina. Resolver contra o endereco errado da 404 em silencio e a
  // imagem sai com a fonte do sistema.
  const regras: { texto: string; base: string }[] = [];
  for (const folha of Array.from(document.styleSheets)) {
    let lista: CSSRuleList;
    try {
      lista = folha.cssRules;
    } catch {
      continue; // folha de outra origem, nao da para ler
    }
    for (const regra of Array.from(lista)) {
      if (regra instanceof CSSFontFaceRule && /montserrat/i.test(regra.cssText)) {
        regras.push({ texto: regra.cssText, base: folha.href ?? document.baseURI });
      }
    }
  }

  // Os mesmos arquivos se repetem entre pesos e subconjuntos; baixar uma vez.
  const baixados = new Map<string, Promise<string | null>>();
  const baixar = (absoluta: string) => {
    if (!baixados.has(absoluta)) {
      baixados.set(
        absoluta,
        fetch(absoluta)
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .then((b) => (b ? `data:font/woff2;base64,${paraBase64(b)}` : null))
          // Sem a fonte embutida o texto cai para a do sistema; melhor isso
          // do que nao gerar a imagem.
          .catch(() => null)
      );
    }
    return baixados.get(absoluta)!;
  };

  const resolvidas = await Promise.all(
    regras.map(async ({ texto, base }) => {
      let saida = texto;
      const urls = Array.from(texto.matchAll(/url\(["']?([^"')]+)["']?\)/g), (m) => m[1]);
      for (const url of urls) {
        if (url.startsWith("data:")) continue;
        const dataUri = await baixar(new URL(url, base).href);
        if (dataUri) saida = saida.replace(url, dataUri);
      }
      return saida;
    })
  );

  return resolvidas.join("\n");
}

export function BotaoCopiarImagem({
  alvo,
  nomeArquivo,
}: {
  /** Seletor do elemento a rasterizar. */
  alvo: string;
  nomeArquivo: string;
}) {
  const [estado, setEstado] = useState<Estado>("parado");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  // Baixar e converter as fontes e a parte cara (uns 7s) e nao depende do
  // clique. Fazendo no carregamento, o botao responde so com a rasterizacao.
  useEffect(() => {
    void cssDasFontes();
  }, []);

  function encerrar(novo: Estado) {
    setEstado(novo);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setEstado("parado"), 3000);
  }

  async function aoClicar() {
    const elemento = document.querySelector<HTMLElement>(alvo);
    if (!elemento) return encerrar("erro");

    setEstado("gerando");
    try {
      // Dinamico: a biblioteca so e baixada quando o botao e usado, e nao
      // entra no pacote inicial da pagina.
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(elemento, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        fontEmbedCSS: await cssDasFontes(),
      });
      if (!blob) throw new Error("rasterizacao devolveu vazio");

      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          return encerrar("copiado");
        } catch (erro) {
          console.warn("clipboard.write de imagem negado; entregando o arquivo", erro);
        }
      }

      // Navegador negou a area de transferencia: entregar o PNG ainda resolve
      // o problema. Tentar colar via execCommand nao vale — o Chrome descarta
      // imagem em data URI e a chamada chega a travar.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(url);
      encerrar("baixado");
    } catch (erro) {
      console.error("falha ao gerar a imagem do slide", erro);
      encerrar("erro");
    }
  }

  const texto =
    estado === "gerando"
      ? "Gerando imagem…"
      : estado === "copiado"
        ? "Copiado — cole no PowerPoint"
        : estado === "baixado"
          ? "Baixado como PNG"
          : estado === "erro"
            ? "Não deu — use Win+Shift+S"
            : "Copiar imagem do slide";

  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={estado === "gerando"}
      className="nao-imprimir flex cursor-pointer items-center gap-1.5 rounded bg-pwr-orange px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-pwr-orange-dark disabled:cursor-wait disabled:opacity-70"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      {texto}
    </button>
  );
}
