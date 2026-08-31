import type { Usuario } from '../types';

/**
 * Sessão do protótipo: apenas os dados do usuário escolhido no login
 * (id, nome, e-mail, perfil). Nada de token/JWT — e a senha nunca é
 * guardada aqui.
 *
 * Storage resiliente (alguns ambientes — iframe de preview — bloqueiam
 * localStorage):
 *   1. localStorage (navegador normal; sobrevive a F5 e abas novas);
 *   2. memória (sobrevive à navegação SPA dentro da página);
 *   3. window.name (quando localStorage está bloqueado, pois sobrevive ao
 *      recarregamento da página mesmo em origem opaca).
 */

const CHAVE_SESSAO = 'rithmo_sessao';
const PREFIXO_JANELA = 'rithmo:sessao:';
const memoria = new Map<string, string>();

// Limpa a chave de token da versão anterior (protótipo não usa mais).
try {
  localStorage.removeItem('rithmo_token');
} catch {
  /* localStorage indisponível */
}

function escreverNomeJanela(valor: string | null): void {
  try {
    const atual = typeof window !== 'undefined' ? window.name : '';
    if (valor === null) {
      if (atual === PREFIXO_JANELA || atual.startsWith(PREFIXO_JANELA)) {
        window.name = '';
      }
      return;
    }
    if (!atual || atual.startsWith(PREFIXO_JANELA)) {
      window.name = `${PREFIXO_JANELA}${valor}`;
    }
  } catch {
    /* window.name indisponível: seguimos sem ele */
  }
}

function lerNomeJanela(): string | null {
  try {
    const atual = typeof window !== 'undefined' ? window.name : '';
    if (atual.startsWith(PREFIXO_JANELA)) {
      return atual.slice(PREFIXO_JANELA.length) || null;
    }
    return null;
  } catch {
    return null;
  }
}

function armazenar(valor: string | null): void {
  let localOk = false;
  try {
    if (valor === null) localStorage.removeItem(CHAVE_SESSAO);
    else localStorage.setItem(CHAVE_SESSAO, valor);
    localOk = true;
  } catch {
    /* localStorage bloqueado (iframe sandbox) */
  }

  if (!localOk) {
    if (valor === null) memoria.delete(CHAVE_SESSAO);
    else memoria.set(CHAVE_SESSAO, valor);
    escreverNomeJanela(valor);
    return;
  }

  memoria.delete(CHAVE_SESSAO);
}

function ler(): string | null {
  try {
    const valor = localStorage.getItem(CHAVE_SESSAO);
    if (valor) return valor;
  } catch {
    /* localStorage bloqueado (iframe sandbox) */
  }

  return memoria.get(CHAVE_SESSAO) ?? lerNomeJanela();
}

function ehUsuario(v: unknown): v is Usuario {
  if (!v || typeof v !== 'object') return false;
  const u = v as Record<string, unknown>;
  return (
    typeof u.id === 'number' &&
    typeof u.nome === 'string' &&
    typeof u.email === 'string' &&
    (u.perfil === 'paciente' || u.perfil === 'psicologo')
  );
}

export function obterUsuarioSessao(): Usuario | null {
  const bruto = ler();
  if (!bruto) return null;
  try {
    const usuario: unknown = JSON.parse(bruto);
    if (ehUsuario(usuario)) return usuario;
  } catch {
    /* sessão corrompida: ignora */
  }
  return null;
}

export function obterIdUsuarioSessao(): number | null {
  return obterUsuarioSessao()?.id ?? null;
}

export function salvarUsuarioSessao(usuario: Usuario): void {
  armazenar(JSON.stringify(usuario));
}

export function limparUsuarioSessao(): void {
  armazenar(null);
}
