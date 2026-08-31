/**
 * Cliente HTTP da API RITHMO.
 * Todas as chamadas usam o prefixo relativo "/api" (proxy do Vite em dev).
 * O token de sessão é anexado automaticamente; ao receber 401 a sessão é
 * encerrada e a aplicação redireciona para o login.
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';
const TIMEOUT_MS = 10_000;
const TOKEN_KEY = 'rithmo_token';

/**
 * Storage resiliente. Alguns ambientes — iframes de preview, navegadores com
 * cookies/armazenamento bloqueado — lançam SecurityError ao acessar
 * localStorage. Sem esta proteção, o token quebra o boot da aplicação.
 *
 * Ordem de persistência:
 *   1. localStorage (navegador normal; sobrevive a F5 e abas novas);
 *   2. memória (sobrevive à navegação SPA dentro da página);
 *   3. window.name (só quando localStorage está bloqueado — como no iframe
 *      sandbox do preview — pois window.name sobrevive ao recarregamento da
 *      página mesmo em origem opaca).
 *
 * O token continua sendo o JWT real emitido pelo backend e é revalidado em
 * /me a cada carregamento; nenhum "login falso" é criado.
 */
const memoria = new Map<string, string>();
const PREFIXO_JANELA = 'rithmo:token:';

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
    /* window.name indisponível (alguns webviews): seguimos sem ele */
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

function armazenar(chave: string, valor: string | null): void {
  let localOk = false;
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
    localOk = true;
  } catch {
    /* localStorage bloqueado (iframe sandbox) */
  }

  if (!localOk) {
    if (valor === null) memoria.delete(chave);
    else memoria.set(chave, valor);
    escreverNomeJanela(valor);
    return;
  }

  memoria.delete(chave);
}

function ler(chave: string): string | null {
  try {
    const valor = localStorage.getItem(chave);
    if (valor) return valor;
  } catch {
    /* localStorage bloqueado (iframe sandbox) */
  }

  return memoria.get(chave) ?? lerNomeJanela();
}

export const obterToken = (): string | null => ler(TOKEN_KEY);
export const salvarToken = (token: string): void => armazenar(TOKEN_KEY, token);
export const limparToken = (): void => armazenar(TOKEN_KEY, null);

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ResultadoJson {
  mensagem?: string;
  [chave: string]: unknown;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controlador = new AbortController();
  const timeout = window.setTimeout(() => controlador.abort(), TIMEOUT_MS);
  const token = obterToken();

  try {
    const resposta = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controlador.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    let corpo: ResultadoJson | null = null;
    try {
      corpo = (await resposta.json()) as ResultadoJson;
    } catch {
      corpo = null;
    }

    if (!resposta.ok) {
      if (resposta.status === 401 && !path.startsWith('/auth/')) {
        limparToken();
        window.dispatchEvent(new Event('rithmo:401'));
      }
      throw new ApiError(
        resposta.status,
        typeof corpo?.mensagem === 'string' ? corpo.mensagem : '',
      );
    }

    return corpo as T;
  } catch (erro) {
    if (erro instanceof ApiError) throw erro;

    if (erro instanceof DOMException && erro.name === 'AbortError') {
      throw new ApiError(0, 'A requisição excedeu o tempo limite.');
    }

    console.error('[api] Falha de rede:', erro);
    throw new ApiError(0, 'Não foi possível conectar ao servidor.');
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string) => request<T>(path, { method: 'PATCH' }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
