// Logotipo oficial, reproduzido do guia de identidade: anel laranja, disco
// laranja e a seta branca. As proporcoes do guia (marca 58, "pwr" 38, "Gestão"
// 11 com 5px de espacamento) viram fracoes da altura, para a marca escalar
// junto com o slide, que se mede em cqw.
export function LogoPwr({
  altura,
  tema = "escuro",
}: {
  /** Qualquer unidade CSS; o resto do logotipo e calculado a partir dela. */
  altura: string;
  /** escuro = aplicado sobre fundo azul/preto. */
  tema?: "claro" | "escuro";
}) {
  const corPwr = tema === "escuro" ? "#fff" : "#05244F";
  const corGestao = tema === "escuro" ? "rgba(255,255,255,0.7)" : "#05244F";

  return (
    <span
      className="flex shrink-0 items-center"
      style={{ gap: `calc(${altura} * 0.18)` }}
      aria-label="PWR Gestão"
    >
      <svg
        viewBox="0 0 58 58"
        style={{ width: altura, height: altura }}
        className="shrink-0"
        role="img"
        aria-hidden="true"
      >
        <circle cx="29" cy="29" r="27" fill="none" stroke="#FF5B00" strokeWidth="3.5" />
        <circle cx="29" cy="29" r="20" fill="#FF5B00" />
        <polyline
          points="23,21 35,29 23,37"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* leading-none cortaria a perna do "p" no peso 900. */}
      <span className="flex flex-col font-pwr" style={{ lineHeight: 1.05 }}>
        <span
          style={{
            fontSize: `calc(${altura} * 0.66)`,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            color: corPwr,
          }}
        >
          pwr
        </span>
        <span
          style={{
            fontSize: `calc(${altura} * 0.19)`,
            fontWeight: 500,
            letterSpacing: "0.42em",
            color: corGestao,
            marginTop: `calc(${altura} * 0.07)`,
          }}
        >
          GESTÃO
        </span>
      </span>
    </span>
  );
}
