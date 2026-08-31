import { api, limparToken, obterToken, salvarToken } from './api';
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

export async function obterSessao(): Promise<Usuario | null> {
  if (!obterToken()) return null;
  try {
    const resposta = await api.get<{ usuario: Usuario }>('/me');
    return resposta.usuario;
  } catch {
    limparToken();
    return null;
  }
}

export function sair(): void {
  limparToken();
}
