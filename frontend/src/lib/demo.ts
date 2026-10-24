import type { Perfil, Usuario } from '../types';

/**
 * Login de protótipo: verifica e-mail + senha contra as contas demo (embutidas
 * no bundle) e as contas criadas no próprio navegador. Não chama a API, não
 * usa JWT/bcrypt/`/me` — é apenas o controle de acesso do protótipo.
 */

interface ContaDemo {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
  codigo?: string | null;
}

interface ContaLocal {
  email: string;
  hash: string;
  id: number;
  nome: string;
  perfil: Perfil;
  codigo?: string | null;
}

export const CONTAS_DEMO: ContaDemo[] = [
  {
    id: 1,
    nome: 'Dra. Marina Costa',
    email: 'psicologa@rithmo.app',
    senha: '123456',
    perfil: 'psicologo',
    codigo: 'RITMO1',
  },
  {
    id: 2,
    nome: 'Ana Beatriz',
    email: 'ana@rithmo.app',
    senha: '123456',
    perfil: 'paciente',
  },
  {
    id: 3,
    nome: 'Lucas Ferreira',
    email: 'lucas@rithmo.app',
    senha: '123456',
    perfil: 'paciente',
  },
];

const CHAVE_CONTAS = 'rithmo_contas_demo';

/** Hash simples (nunca senha em texto puro) para contas criadas no protótipo. */
async function hashSenha(senha: string): Promise<string> {
  try {
    if (globalThis.crypto?.subtle) {
      const bytes = new TextEncoder().encode(senha);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    /* cai no fallback abaixo */
  }
  let h = 5381;
  for (let i = 0; i < senha.length; i += 1) {
    h = ((h << 5) + h + senha.charCodeAt(i)) | 0;
  }
  return `djb2:${(h >>> 0).toString(16)}`;
}

function lerContas(): ContaLocal[] {
  try {
    const bruto = localStorage.getItem(CHAVE_CONTAS);
    if (!bruto) return [];
    const contas: unknown = JSON.parse(bruto);
    return Array.isArray(contas) ? (contas as ContaLocal[]) : [];
  } catch {
    return [];
  }
}

function salvarContas(contas: ContaLocal[]): void {
  try {
    localStorage.setItem(CHAVE_CONTAS, JSON.stringify(contas));
  } catch {
    /* localStorage bloqueado: contas criadas não persistem entre abas */
  }
}

function paraUsuario(conta: ContaDemo | ContaLocal): Usuario {
  return {
    id: conta.id,
    nome: conta.nome,
    email: conta.email,
    perfil: conta.perfil,
    codigo: conta.codigo ?? null,
  };
}

/** Retorna o usuário demo se e-mail + senha corresponderem; senão null. */
export async function autenticarContaDemo(
  email: string,
  senha: string,
): Promise<Usuario | null> {
  const emailNormalizado = email.trim().toLowerCase();

  const demo = CONTAS_DEMO.find((c) => c.email === emailNormalizado);
  if (demo) {
    if (demo.senha !== senha) return null;
    return paraUsuario(demo);
  }

  const conta = lerContas().find((c) => c.email === emailNormalizado);
  if (!conta) return null;
  if ((await hashSenha(senha)) !== conta.hash) return null;

  return paraUsuario(conta);
}

/** Guarda a conta criada (apenas hash da senha) para permitir novo login. */
export async function registrarContaDemo(
  usuario: Usuario,
  senha: string,
): Promise<void> {
  const contas = lerContas().filter((c) => c.email !== usuario.email);
  contas.push({
    email: usuario.email,
    hash: await hashSenha(senha),
    id: usuario.id,
    nome: usuario.nome,
    perfil: usuario.perfil,
    codigo: usuario.codigo ?? null,
  });
  salvarContas(contas);
}
