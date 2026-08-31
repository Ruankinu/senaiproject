interface IconeProps {
  nome: string;
  tamanho?: number;
  className?: string;
}

/**
 * Conjunto único de ícones (traço 1.6, geométricos) — usados somente
 * quando melhoram a compreensão ou economizam espaço.
 */
export function Icone({ nome, tamanho = 16, className }: IconeProps) {
  const caminhos: Record<string, JSX.Element> = {
    plus: <path d="M8 3.5v9M3.5 8h9" />,
    check: <path d="M3.5 8.5l3 3 6-7" />,
    pencil: <path d="M3 13h4M3 13l.5-2.4 6.8-6.8 1.9 1.9-6.8 6.8L3 13z" />,
    trash: (
      <>
        <path d="M2.5 4.5h11M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.6 8.2a1.5 1.5 0 001.5 1.3h2.8a1.5 1.5 0 001.5-1.3l.6-8.2M6.5 7.5v3.5M9.5 7.5v3.5" />
      </>
    ),
    'arrow-left': <path d="M8.5 2.5L3 8l5.5 5.5M3 8h10" />,
    'chevron-right': <path d="M6 3.5L10.5 8L6 12.5" />,
    x: <path d="M4 4l8 8M12 4l-8 8" />,
    logout: (
      <>
        <path d="M6.5 2.5H4a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 004 13.5h2.5" />
        <path d="M10.5 5L14 8l-3.5 3M14 8H6" />
      </>
    ),
    copy: (
      <>
        <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
        <path d="M10.5 5.5V4a1 1 0 00-1-1H4a1 1 0 00-1 1v5.5a1 1 0 001 1h1.5" />
      </>
    ),
    users: (
      <>
        <circle cx="5.5" cy="5" r="2" />
        <path d="M2 13a3.5 3.5 0 017 0" />
        <circle cx="11" cy="5" r="2" />
        <path d="M11 8.5a3.5 3.5 0 013.5 3.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="10" height="8.5" rx="1" />
        <path d="M3 7.5h10M5.5 2.8v3.4M10.5 2.8v3.4" />
      </>
    ),
    trophy: (
      <>
        <path d="M5.5 3.5h5v4a2.5 2.5 0 01-5 0z" />
        <path d="M5.5 4.5H3.8a1.7 1.7 0 001.7 2.4M10.5 4.5h1.7a1.7 1.7 0 01-1.7 2.4" />
        <path d="M6.8 10v1.8M9.2 10v1.8M5.8 11.8h4.4M6.4 13.8h3.2v-2H6.4z" />
      </>
    ),
    flame: (
      <path d="M8 2.5c1 2 .4 3.1-.4 4.2C7 7.8 6 8.9 6 10a2 2 0 004 0c0-1.4-1-2.4-1.8-3.4C7.4 5.5 8 4 8 2.5z" />
    ),
  };

  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {caminhos[nome] ?? null}
    </svg>
  );
}
