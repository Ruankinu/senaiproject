import { api } from './api';
import { autenticarContaDemo, registrarContaDemo } from './demo';
import {
  limparUsuarioSessao,
  obterUsuarioSessao,
  salvarUsuarioSessao,
} from './sessao';
import type { Perfil, Usuario } from '../types';

/**
 * Autenticação de PROTÓTIPO.
 * O login verifica e-mail + senha LOCALMENTE (contas demo embutidas + contas
 * criadas no navegador) e salva apenas os dados do usuário na sessão.
 * Não há JWT, bcrypt no fluxo, Bearer token nem consulta a /me.
 */

export async function entrar(
  email: string,
  senha: string,
): Promise<Usuario | null> {
  const usuario = await autenticarContaDemo(email, senha);
  if (!usuario) return null;

  salvarUsuarioSessao(usuario);
  return usuario;
}

export async function registrar(dados: {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
}): Promise<Usuario> {
  // Persiste a conta demo no JSON do servidor (dados reais do protótipo);
  // o token devolvido é ignorado — a entrada é controlada pela sessão local.
  const resposta = await api.post<{ usuario: Usuario }>('/auth/registro', dados);
  const usuario = resposta.usuario;

  await registrarContaDemo(usuario, dados.senha);
  salvarUsuarioSessao(usuario);
  return usuario;
}

/** Restaura a sessão do protótipo direto do storage — sem rede. */
export function obterSessao(): Usuario | null {
  return obterUsuarioSessao();
}

export function sair(): void {
  limparUsuarioSessao();
}
