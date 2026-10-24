import { limparUsuarioSessao, obterIdUsuarioSessao } from './sessao';

/**
 * Cliente HTTP da API RITHMO (protótipo).
 * Todas as chamadas usam o prefixo relativo "/api". Não há token/JWT: a
 * identidade demo vai no cabeçalho X-Demo-Usuario (id), e o backend resolve
 * o usuário no JSON para escopar os dados.
 */

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';
const TIMEOUT_MS = 10_000;

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
  const idUsuario = obterIdUsuarioSessao();

  try {
    const resposta = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controlador.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(idUsuario ? { 'X-Demo-Usuario': String(idUsuario) } : {}),
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
        limparUsuarioSessao();
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

/**
 * Baixa um arquivo (ex.: a CIP) como Blob, mandando a mesma identidade demo
 * do restante da API. Não dá pra usar <a href> direto porque o cabeçalho
 * X-Demo-Usuario não viaja num link.
 */
export async function baixarArquivo(path: string): Promise<Blob> {
  const idUsuario = obterIdUsuarioSessao();
  const resposta = await fetch(`${API_BASE}${path}`, {
    headers: idUsuario ? { 'X-Demo-Usuario': String(idUsuario) } : {},
  });
  if (!resposta.ok) {
    let mensagem = '';
    try {
      const corpo = (await resposta.json()) as ResultadoJson;
      mensagem = typeof corpo?.mensagem === 'string' ? corpo.mensagem : '';
    } catch {
      mensagem = '';
    }
    throw new ApiError(resposta.status, mensagem);
  }
  return resposta.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  // NOVO — body opcional: chamadas antigas (sem body) continuam iguais.
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};