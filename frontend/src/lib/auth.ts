import { api, limparToken, obterToken, salvarToken } from './api';
import type { Perfil, Usuario } from '../types';

interface RespostaAuth {
  token: string;
  usuario: Usuario;
}

export async function entrar(email: string, senha: string): Promise<Usuario> {
  const resposta = await api.post<RespostaAuth>('/auth/login', { email, senha });
  salvarToken(resposta.token);
  return resposta.usuario;
}

export async function registrar(dados: {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}): Promise<Usuario> {
  const resposta = await api.post<RespostaAuth>('/auth/registro', dados);
  salvarToken(resposta.token);
  return resposta.usuario;
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
