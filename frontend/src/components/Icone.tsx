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
    refresh: (
      <>
        <path d="M13 8a5 5 0 11-1.4-4.1" />
        <path d="M13 2.8v3.4H9.6" />
      </>
    ),
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
    user: (
      <>
        <circle cx="8" cy="5" r="2.5" />
        <path d="M3.2 13.5a4.8 4.8 0 019.6 0" />
      </>
    ),
    dot: <circle cx="8" cy="8" r="2.6" fill="currentColor" stroke="none" />,
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
