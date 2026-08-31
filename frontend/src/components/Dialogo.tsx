import { useEffect, useRef, type ReactNode } from 'react';
import { Icone } from './Icone';

interface DialogoProps {
  aberto: boolean;
  onFechar: () => void;
  rotulo: string;
  children: ReactNode;
}

const FOCUSAVEIS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo leve (modal) com foco gerenciado, tecla Esc e bloqueio de rolagem.
 * No mobile vira uma folha inferior; no desktop, um painel centralizado.
 */
export function Dialogo({ aberto, onFechar, rotulo, children }: DialogoProps) {
  const painel = useRef<HTMLDivElement>(null);
  const anterior = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!aberto) return;

    anterior.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        onFechar();
        return;
      }

      if (evento.key !== 'Tab' || !painel.current) return;

      const focaveis = Array.from(
        painel.current.querySelectorAll<HTMLElement>(FOCUSAVEIS),
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') &&
          !el.closest('.dialogo__fechar'),
      );

      if (focaveis.length === 0) return;

      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    const temporizador = window.setTimeout(() => {
      const primeiro = painel.current?.querySelector<HTMLElement>(FOCUSAVEIS);
      primeiro?.focus();
    }, 30);

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      window.clearTimeout(temporizador);
      document.body.style.overflow = '';
      anterior.current?.focus();
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="dialogo">
      <button
        type="button"
        className="dialogo__backdrop"
        aria-label="Fechar"
        onClick={onFechar}
      />
      <div
        ref={painel}
        className="dialogo__painel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={rotulo}
      >
        <button
          type="button"
          className="btn btn--icone dialogo__fechar"
          aria-label="Fechar"
          onClick={onFechar}
        >
          <Icone nome="x" tamanho={14} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogoTitulo({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="dialogo__titulo">{children}</h2>;
}
