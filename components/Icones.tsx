type Props = { className?: string };

const base = "h-4 w-4 shrink-0";

function Svg({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? base}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconeVisaoGeral(p: Props) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}

export function IconeRenovacoes(p: Props) {
  return (
    <Svg {...p}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Svg>
  );
}

export function IconeRecorrencia(p: Props) {
  return (
    <Svg {...p}>
      <path d="M3 21h18" />
      <rect x="5" y="12" width="3.5" height="6" rx="0.5" />
      <rect x="10.25" y="8" width="3.5" height="10" rx="0.5" />
      <rect x="15.5" y="4" width="3.5" height="14" rx="0.5" />
    </Svg>
  );
}

export function IconeProjetos(p: Props) {
  return (
    <Svg {...p}>
      <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z" />
      <path d="M16 5h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2" />
      <path d="m9 13 2 2 4-4" />
    </Svg>
  );
}

export function IconeContratos(p: Props) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h4" />
    </Svg>
  );
}
