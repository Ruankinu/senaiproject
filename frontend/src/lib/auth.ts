import { api, ApiError, limparToken, obterToken, salvarToken } from './api';
import type { Perfil, Usuario } from '../types';

interface RespostaAuth {
  token: string;
  usuario: Usuario;
}

/**
 * O login/registro retornam o usuário básico; o perfil completo (codigo do
 * psicólogo, vínculo do paciente) só vem de /me. Buscamos /me após autenticar
 * para que a sessão já comece com todos os dados do perfil.
 */
async function comPerfilCompleto(resposta: RespostaAuth): Promise<Usuario> {
  salvarToken(resposta.token);
  const perfil = await api.get<{ usuario: Usuario }>('/me');
  return perfil.usuario;
}

export async function entrar(email: string, senha: string): Promise<Usuario> {
  const resposta = await api.post<RespostaAuth>('/auth/login', { email, senha });
  return comPerfilCompleto(resposta);
}

export async function registrar(dados: {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}): Promise<Usuario> {
  const resposta = await api.post<RespostaAuth>('/auth/registro', dados);
  return comPerfilCompleto(resposta);
}

/**
 * Restaura a sessão no boot.
 *
 * Regra de verdade (nunca tratar "ainda não verificado" como
 * "não autenticado"):
 *  - sem token → null (usuário vai para o login, sem chamada de rede);
 *  - /me 401  → token real é inválido/expirado: limpa e retorna null;
 *  - /me 200  → usuário autenticado;
 *  - falha de rede/5xx → LANÇA. Quem chama (AuthProvider) faz retry com
 *    backoff e mantém o estado "carregando" — a sessão válida não é
 *    descartada por um pico de instabilidade.
 */
export async function obterSessao(): Promise<Usuario | null> {
  if (!obterToken()) return null;
  try {
    const resposta = await api.get<{ usuario: Usuario }>('/me');
    return resposta.usuario;
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401) {
      limparToken();
      return null;
    }
    throw erro;
  }
}

export function sair(): void {
  limparToken();
}
