import { LogoPwr } from "@/components/LogoPwr";
import { type LinhaPainel, PainelBarras } from "@/components/PainelBarras";
import type { Leitura } from "@/lib/leitura-executiva";

export type CartaoKpi = {
  rotulo: string;
  valor: string;
  nota?: string;
  /** escuro e o acumulado, laranja e a receita do mes: a hierarquia visual
   *  diz onde olhar antes de ler. */
  estilo: "claro" | "laranja" | "escuro";
};

export type PainelSlide = {
  numero: string;
  titulo: string;
  nota: string;
  linhas: LinhaPainel[];
  rotuloTotal: string;
  totalContratos: number;
  totalReceita: number;
};

// Trechos entre ** viram negrito.
function comNegrito(texto: string) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i} className="font-semibold text-pwr-dark-blue">
        {parte.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{parte}</span>
    )
  );
}

export function SlideMotivos({
  periodo,
  notaBase,
  kpis,
  paineis,
  leitura,
}: {
  periodo: string;
  notaBase: string;
  kpis: CartaoKpi[];
  paineis: PainelSlide[];
  leitura: Leitura | null;
}) {
  return (
    <section
      className="slide relative flex w-full flex-col overflow-hidden bg-white font-pwr"
      style={{
        aspectRatio: "16 / 9",
        containerType: "inline-size",
        border: "0.25cqw solid #FF5B00",
      }}
    >
      <header
        className="flex shrink-0 items-center justify-between gap-4 bg-pwr-dark-blue"
        style={{ padding: "1.1cqw 2cqw" }}
      >
        <div className="flex min-w-0 items-center" style={{ gap: "1.3cqw" }}>
          <LogoPwr altura="2.9cqw" tema="escuro" />
          <span
            className="shrink-0 self-stretch"
            style={{ width: "0.1cqw", background: "rgba(255,255,255,0.18)" }}
          />
          <div className="min-w-0">
            <h2
              className="truncate leading-tight font-bold text-white"
              style={{ fontSize: "1.9cqw" }}
            >
              Análise de Resultado Mensal
            </h2>
            <p
              className="truncate font-semibold tracking-wide text-pwr-orange uppercase"
              style={{ fontSize: "0.78cqw", marginTop: "0.25cqw" }}
            >
              Contratos encerrados · Motivos de não renovação · Gerentes
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="leading-tight font-bold text-white" style={{ fontSize: "1.75cqw" }}>
            {periodo}
          </p>
          <p
            className="tracking-wide text-white/45 uppercase"
            style={{ fontSize: "0.72cqw", marginTop: "0.25cqw" }}
          >
            {notaBase}
          </p>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ padding: "1.3cqw 1.6cqw", gap: "1.1cqw" }}
      >
        <div className="grid shrink-0 grid-cols-4" style={{ gap: "0.9cqw" }}>
          {kpis.map((k) => {
            const escuro = k.estilo === "escuro";
            const laranja = k.estilo === "laranja";
            return (
              <div
                key={k.rotulo}
                className="min-w-0 rounded"
                style={{
                  padding: "0.9cqw 1.1cqw",
                  background: escuro ? "#05244F" : laranja ? "rgba(255,91,0,0.07)" : "#F5F7FA",
                  borderLeft: `0.3cqw solid ${laranja ? "#FF5B00" : escuro ? "#FF5B00" : "#3C58B4"}`,
                }}
              >
                <p
                  className={`truncate font-semibold tracking-wide uppercase ${
                    escuro ? "text-white/55" : "text-pwr-blue/50"
                  }`}
                  style={{ fontSize: "0.72cqw" }}
                >
                  {k.rotulo}
                </p>
                <p
                  className={`truncate leading-tight font-bold ${
                    escuro ? "text-white" : laranja ? "text-pwr-orange" : "text-pwr-dark-blue"
                  }`}
                  style={{ fontSize: "1.85cqw", marginTop: "0.2cqw" }}
                >
                  {k.valor}
                </p>
                {k.nota && (
                  <p
                    className={`truncate ${escuro ? "text-white/45" : "text-pwr-blue/45"}`}
                    style={{ fontSize: "0.7cqw", marginTop: "0.2cqw" }}
                  >
                    {k.nota}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1" style={{ gap: "0.9cqw" }}>
          {paineis.map((p) => (
            <PainelBarras key={p.numero} {...p} />
          ))}
        </div>

        {leitura && (
          <div className="flex shrink-0 overflow-hidden rounded" style={{ background: "#F5F7FA" }}>
            <div
              className="flex shrink-0 flex-col justify-center bg-pwr-dark-blue text-center"
              style={{ width: "11cqw", padding: "0.8cqw" }}
            >
              <p className="font-bold text-pwr-orange" style={{ fontSize: "2.5cqw", lineHeight: 1.25 }}>
                {leitura.destaqueValor}
              </p>
              <p
                className="leading-tight font-semibold tracking-wide text-white/60 uppercase"
                style={{ fontSize: "0.66cqw", marginTop: "0.35cqw" }}
              >
                {leitura.destaqueRotulo}
              </p>
            </div>

            <div className="min-w-0 flex-1" style={{ padding: "0.9cqw 1.2cqw" }}>
              <p
                className="truncate font-bold tracking-wide text-pwr-orange uppercase"
                style={{ fontSize: "0.8cqw" }}
              >
                Leitura executiva — {leitura.titulo}
              </p>
              <p
                className="text-pwr-blue/80"
                style={{ fontSize: "0.82cqw", lineHeight: 1.55, marginTop: "0.35cqw" }}
              >
                {leitura.frases.map((f, i) => (
                  <span key={i}>
                    {comNegrito(f)}
                    {i < leitura.frases.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
