interface IconeProps {
  nome: string;
  tamanho?: number;
  className?: string;
}

/**
 * Conjunto único e coerente de ícones (traço 1.6, geométricos).
 * Usados somente quando melhoram a compreensão ou economizam espaço.
 */
export function Icone({ nome, tamanho = 16, className }: IconeProps) {
  const caminhos: Record<string, JSX.Element> = {
    plus: <path d="M8 3.5v9M3.5 8h9" />,
    check: <path d="M3.5 8.5l3 3 6-7" />,
    pencil: (
      <>
        <path d="M11.3 2.9l1.8 1.8M3 13l.6-2.5 7.4-7.4a1.27 1.27 0 011.8 0l.1.1a1.27 1.27 0 010 1.8L5.5 12.4 3 13z" />
      </>
    ),
    trash: (
      <>
        <path d="M2.5 4.5h11M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.6 8.2a1.5 1.5 0 001.5 1.3h2.8a1.5 1.5 0 001.5-1.3l.6-8.2M6.5 7.5v3.5M9.5 7.5v3.5" />
      </>
    ),
    'arrow-left': <path d="M8.5 2.5L3 8l5.5 5.5M3 8h10" />,
    x: <path d="M4 4l8 8M12 4l-8 8" />,
    refresh: (
      <>
        <path d="M13 8a5 5 0 11-1.4-4.1" />
        <path d="M13 2.8v3.4H9.6" />
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
