interface MarcaProps {
  tamanho?: 'pequena' | 'media' | 'grande';
  comPalavra?: boolean;
  className?: string;
}

/**
 * Marca oficial do RITHMO (formato fornecido pelo produto: laço infinito
 * com folha + wordmark "rithmo" em caixa baixa), reestilizada para a
 * identidade atual: roxo escuro + branco, folha em verde funcional.
 */
export function Marca({
  tamanho = 'media',
  comPalavra = true,
  className = '',
}: MarcaProps) {
  return (
    <span className={`marca-marca marca-marca--${tamanho} ${className}`}>
      <svg
        className="marca-marca__simbolo"
        viewBox="0 0 72 72"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="ritmo-roxo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="ritmo-verde" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4ade80" />
            <stop offset="1" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <g transform="translate(36 43) scale(0.92) translate(-34 -43)">
          <path
            d="M34 43 C30 30 14 30 14 43 C14 56 30 56 34 43 C38 56 54 56 54 43 C54 30 38 30 34 43 Z"
            fill="none"
            stroke="url(#ritmo-roxo)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M34 43 C31 33 18 33 18 43 C18 53 31 53 34 43 C37 53 50 53 50 43 C50 33 37 33 34 43 Z"
            fill="none"
            stroke="url(#ritmo-roxo)"
            strokeWidth="1.1"
            opacity="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="39" r="1.6" fill="#c4b5fd" />
          <circle cx="47" cy="39" r="1.6" fill="#c4b5fd" />
          <circle cx="23" cy="47" r="1.6" fill="#c4b5fd" />
          <circle cx="45" cy="47" r="1.6" fill="#c4b5fd" />
          <path
            d="M19 32 C16 24 16 18 14 12"
            fill="none"
            stroke="url(#ritmo-verde)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M14 12 C26 9 31 16 27 22 C21 27 13 21 14 12 Z"
            fill="url(#ritmo-verde)"
          />
          <path
            d="M14 12 C7 10 3 14 5 19 C9 23 14 18 14 12 Z"
            fill="url(#ritmo-verde)"
            opacity="0.85"
          />
          <path d="M15 13 L26 21" stroke="#1e1233" strokeWidth="0.8" opacity="0.3" />
        </g>
      </svg>
      {comPalavra && <span className="marca-marca__palavra">rithmo</span>}
    </span>
  );
}
