import { BotaoCopiar } from "@/components/BotaoCopiar";
import { FiltrosMotivos } from "@/components/FiltrosMotivos";
import { Slide, TabelaSlide } from "@/components/Slide";
import { type ParametrosMotivos, analisarMotivos } from "@/lib/analise-motivos";
import { ROTULO_BASE_VALOR, formatarMoeda, getBaseContratos } from "@/lib/contratos-base";
import {
  type ColunaExport,
  type LinhaExport,
  limitarLinhas,
  tabelaHtml,
  tabelaTexto,
} from "@/lib/exportar";

// Um slide projetado nao comporta mais que isto sem virar letra miuda.
const MAX_LINHAS = 8;
const MAX_LINHAS_CRUZAMENTO = 9;

function pctStr(parte: number, total: number): string {
  return total > 0 ? `${((parte / total) * 100).toFixed(1).replace(".", ",")}%` : "—";
}

export default async function ApresentacaoPage({
  searchParams,
}: {
  searchParams: Promise<ParametrosMotivos>;
}) {
  const a = analisarMotivos(await searchParams);
  const base = getBaseContratos();
  const geradoEm = new Date(base.gerado).toLocaleDateString("pt-BR");
  const rodape = `Encerramentos · ${a.mesRotulo} · receita por ${ROTULO_BASE_VALOR[a.baseValor].toLowerCase()} · base de ${geradoEm}`;

  const colunasMotivo: ColunaExport[] = [
    { titulo: "Motivo", alinhamento: "left" },
    { titulo: "Contratos" },
    { titulo: "% contr." },
    { titulo: "Receita encerrada" },
    { titulo: "% receita" },
  ];
  const largurasMotivo = ["40%", "15%", "13%", "20%", "12%"];

  const colunasCruz: ColunaExport[] = [
    { titulo: "Motivo", alinhamento: "left" },
    { titulo: "Gerente", alinhamento: "left" },
    { titulo: "Contratos" },
    { titulo: "% contr." },
    { titulo: "Receita encerrada" },
    { titulo: "% receita" },
  ];
  const largurasCruz = ["26%", "22%", "12%", "12%", "18%", "10%"];

  const emLinhas = (
    linhas: LinhaExport[],
    totalContratos: number,
    totalReceita: number
  ): string[][] =>
    linhas.map((l) => [
      ...l.rotulos,
      String(l.contratos),
      pctStr(l.contratos, totalContratos),
      formatarMoeda(l.receita),
      pctStr(l.receita, totalReceita),
    ]);

  const linhasMes = emLinhas(
    limitarLinhas(
      a.motivosMes.map((m) => ({ rotulos: [m.rotulo], contratos: m.contratos, receita: m.receita })),
      MAX_LINHAS
    ),
    a.doMes.length,
    a.receitaMes
  );
  const totalMes = ["Total", String(a.doMes.length), "100,0%", formatarMoeda(a.receitaMes), "100,0%"];

  const linhasAcumulado = emLinhas(
    limitarLinhas(
      a.motivosAcumulado.map((m) => ({
        rotulos: [m.rotulo],
        contratos: m.contratos,
        receita: m.receita,
      })),
      MAX_LINHAS
    ),
    a.doAcumulado.length,
    a.receitaAcumulada
  );
  const totalAcumulado = [
    "Total",
    String(a.doAcumulado.length),
    "100,0%",
    formatarMoeda(a.receitaAcumulada),
    "100,0%",
  ];

  const linhasCruz = emLinhas(
    limitarLinhas(
      a.linhasCruzamento.map((l) => ({
        // No slide o motivo vai repetido: sem a linha anterior a vista, a
        // celula vazia da tabela da tela viraria uma coluna sem sentido.
        rotulos: [l.motivo, l.gerente],
        contratos: l.contratos,
        receita: l.receita,
      })),
      MAX_LINHAS_CRUZAMENTO
    ),
    a.doMes.length,
    a.receitaMes
  );
  const totalCruz = [
    "Total",
    "",
    String(a.doMes.length),
    "100,0%",
    formatarMoeda(a.receitaMes),
    "100,0%",
  ];

  const kpis = [
    { rotulo: "Contratos encerrados", valor: String(a.doMes.length) },
    { rotulo: "Receita encerrada no mês", valor: formatarMoeda(a.receitaMes) },
    { rotulo: `Receita acumulada (${a.acumuladoRotulo})`, valor: formatarMoeda(a.receitaAcumulada) },
    {
      rotulo: "Principal motivo",
      valor: a.principal
        ? `${a.principal.rotulo} — ${a.principal.contratos} (${pctStr(a.principal.contratos, a.doMes.length)})`
        : "—",
    },
  ];

  const textoResumo = a.resumo.map((p) => `${p.titulo}\n${p.texto}`).join("\n\n");
  const htmlResumo =
    `<p style="font-family:Arial,sans-serif;font-size:12pt;font-weight:700;color:#05244F;margin:0 0 8px;">Resumo Executivo — ${a.mesRotulo}</p>` +
    a.resumo
      .map(
        (p) =>
          `<p style="font-family:Arial,sans-serif;font-size:11pt;color:#05244F;margin:0 0 8px;"><b>${p.titulo}:</b> ${p.texto}</p>`
      )
      .join("");

  return (
    <>
      <div className="nao-imprimir">
        <p className="mt-3 text-xs text-pwr-blue/50">
          Os mesmos números da aba Motivos, em 16:9. Para levar ao PowerPoint:{" "}
          <strong className="font-medium text-pwr-blue/70">Ctrl+P → Salvar como PDF</strong> sai
          um slide por página em paisagem, e <strong className="font-medium text-pwr-blue/70">
            Win+Shift+S
          </strong>{" "}
          recorta um slide como imagem. Os botões <em>Copiar</em> colam no PowerPoint como tabela
          editável, não como figura.
        </p>

        <FiltrosMotivos
          ano={a.ano}
          mes={a.mes}
          ate={a.ate}
          interno={a.interno}
          valor={a.baseValor}
          anosDisponiveis={a.anos}
        />
      </div>

      <div className="mt-5 flex flex-col gap-6">
        <Slide
          titulo={`Encerramentos — ${a.mesRotulo}`}
          subtitulo={`Receita encerrada medida por ${ROTULO_BASE_VALOR[a.baseValor].toLowerCase()}`}
          rodape={rodape}
          acao={
            <BotaoCopiar
              rotulo="Copiar indicadores"
              html={tabelaHtml(
                [{ titulo: "Indicador", alinhamento: "left" }, { titulo: "Valor" }],
                kpis.map((k) => [k.rotulo, k.valor]),
                null,
                `Encerramentos — ${a.mesRotulo}`
              )}
              texto={tabelaTexto(
                [{ titulo: "Indicador" }, { titulo: "Valor" }],
                kpis.map((k) => [k.rotulo, k.valor]),
                null,
                `Encerramentos — ${a.mesRotulo}`
              )}
            />
          }
        >
          <div className="flex h-full flex-col" style={{ gap: "1.8cqw" }}>
            <div className="grid flex-1 grid-cols-2" style={{ gap: "1.8cqw" }}>
              {kpis.map((k) => (
                <div
                  key={k.rotulo}
                  className="flex flex-col justify-center rounded border-l-[0.35cqw] border-pwr-orange bg-pwr-dark-blue/[0.04]"
                  style={{ padding: "1.4cqw 2cqw" }}
                >
                  <p
                    className="truncate font-medium tracking-wide text-pwr-blue/55 uppercase"
                    style={{ fontSize: "1.1cqw" }}
                  >
                    {k.rotulo}
                  </p>
                  <p
                    className="truncate leading-tight font-semibold text-pwr-dark-blue"
                    style={{ fontSize: "2.6cqw", marginTop: "0.4cqw" }}
                  >
                    {k.valor}
                  </p>
                </div>
              ))}
            </div>

            {/* A frase de abertura do resumo, para o slide de capa ja dizer o
                que aconteceu e nao so quanto deu. */}
            {a.resumo[0] && (
              <div className="shrink-0 rounded bg-pwr-dark-blue" style={{ padding: "1.5cqw 2cqw" }}>
                <p className="text-white/85" style={{ fontSize: "1.35cqw", lineHeight: 1.5 }}>
                  {a.resumo[0].texto}
                </p>
              </div>
            )}
          </div>
        </Slide>

        <Slide
          titulo="Motivos de encerramento no mês"
          subtitulo={`${a.mesRotulo} · ${a.doMes.length} contratos`}
          rodape={rodape}
          acao={
            <BotaoCopiar
              html={tabelaHtml(
                colunasMotivo,
                linhasMes,
                totalMes,
                `Motivos de encerramento — ${a.mesRotulo}`
              )}
              texto={tabelaTexto(
                colunasMotivo,
                linhasMes,
                totalMes,
                `Motivos de encerramento — ${a.mesRotulo}`
              )}
            />
          }
        >
          <TabelaSlide
            colunas={colunasMotivo.map((c, i) => ({
              titulo: c.titulo,
              largura: largurasMotivo[i],
            }))}
            linhas={linhasMes}
            total={a.doMes.length > 0 ? totalMes : null}
          />
        </Slide>

        <Slide
          titulo="Motivos no acumulado do ano"
          subtitulo={`${a.acumuladoRotulo} · ${a.doAcumulado.length} contratos`}
          rodape={rodape}
          acao={
            <BotaoCopiar
              html={tabelaHtml(
                colunasMotivo,
                linhasAcumulado,
                totalAcumulado,
                `Motivos no acumulado — ${a.acumuladoRotulo}`
              )}
              texto={tabelaTexto(
                colunasMotivo,
                linhasAcumulado,
                totalAcumulado,
                `Motivos no acumulado — ${a.acumuladoRotulo}`
              )}
            />
          }
        >
          <TabelaSlide
            colunas={colunasMotivo.map((c, i) => ({
              titulo: c.titulo,
              largura: largurasMotivo[i],
            }))}
            linhas={linhasAcumulado}
            total={a.doAcumulado.length > 0 ? totalAcumulado : null}
          />
        </Slide>

        <Slide
          titulo="Motivo por gerente de projeto"
          subtitulo={`${a.mesRotulo} · somente o mês de referência`}
          rodape={rodape}
          acao={
            <BotaoCopiar
              html={tabelaHtml(
                colunasCruz,
                linhasCruz,
                totalCruz,
                `Motivo por gerente — ${a.mesRotulo}`
              )}
              texto={tabelaTexto(
                colunasCruz,
                linhasCruz,
                totalCruz,
                `Motivo por gerente — ${a.mesRotulo}`
              )}
            />
          }
        >
          <TabelaSlide
            colunas={colunasCruz.map((c, i) => ({ titulo: c.titulo, largura: largurasCruz[i] }))}
            linhas={linhasCruz}
            total={a.doMes.length > 0 ? totalCruz : null}
          />
        </Slide>

        <Slide
          titulo="Resumo executivo do mês"
          subtitulo={a.mesRotulo}
          rodape={rodape}
          acao={<BotaoCopiar rotulo="Copiar texto" html={htmlResumo} texto={textoResumo} />}
        >
          <div className="grid grid-cols-2 gap-x-[3cqw] gap-y-[1.8cqw]">
            {a.resumo.map((p) => (
              <div key={p.titulo}>
                <h3
                  className="font-semibold tracking-wide text-pwr-orange uppercase"
                  style={{ fontSize: "1.15cqw" }}
                >
                  {p.titulo}
                </h3>
                <p
                  className="text-pwr-blue/80"
                  style={{ fontSize: "1.3cqw", lineHeight: 1.5, marginTop: "0.4cqw" }}
                >
                  {p.texto}
                </p>
              </div>
            ))}
          </div>
        </Slide>
      </div>
    </>
  );
}
