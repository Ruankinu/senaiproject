import { useCallback, useEffect, useState } from 'react';

type Preferencia = 'claro' | 'escuro' | null; // null = segue o sistema

const CHAVE = 'rithmo-tema';

function lerPreferenciaSalva(): Preferencia {
  const salvo = localStorage.getItem(CHAVE);
  return salvo === 'claro' || salvo === 'escuro' ? salvo : null;
}

function sistemaEhEscuro(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Por padrão o tema segue a preferência do sistema/navegador (automático,
 * via CSS). Quando a pessoa clica no botão, a escolha vira explícita,
 * é salva em localStorage e passa a mandar — mesmo que o sistema mude.
 */
export function useTema() {
  const [preferencia, setPreferencia] = useState<Preferencia>(lerPreferenciaSalva);
  const [sistemaEscuro, setSistemaEscuro] = useState(sistemaEhEscuro);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const ouvir = (evento: MediaQueryListEvent) => setSistemaEscuro(evento.matches);
    mql.addEventListener('change', ouvir);
    return () => mql.removeEventListener('change', ouvir);
  }, []);

  useEffect(() => {
    const raiz = document.documentElement;
    if (preferencia) {
      raiz.setAttribute('data-tema', preferencia);
      localStorage.setItem(CHAVE, preferencia);
    } else {
      raiz.removeAttribute('data-tema');
      localStorage.removeItem(CHAVE);
    }
  }, [preferencia]);

  const escuroAtivo = preferencia ? preferencia === 'escuro' : sistemaEscuro;

  const alternar = useCallback(() => {
    setPreferencia(escuroAtivo ? 'claro' : 'escuro');
  }, [escuroAtivo]);

  return { escuroAtivo, alternar };
}