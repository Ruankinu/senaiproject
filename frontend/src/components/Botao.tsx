import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primaria' | 'fantasma' | 'perigo' | 'sucesso' | 'icone';

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  carregando?: boolean;
  children?: ReactNode;
}

export function Botao({
  variante = 'primaria',
  carregando = false,
  className = '',
  children,
  disabled,
  ...rest
}: BotaoProps) {
  return (
    <button
      className={`btn btn--${variante} ${className}`}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...rest}
    >
      {carregando && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
