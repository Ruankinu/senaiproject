import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Perfil, Usuario } from '../types';
import * as authLib from '../lib/auth';
import { salvarUsuarioSessao } from '../lib/sessao';

interface ContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<Usuario | null>;
  registrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    perfil: Perfil;
  }) => Promise<Usuario>;
  sair: () => void;
  // NOVO — atualiza o usuário em memória e na sessão salva (ex.: depois de
  // trocar a foto de perfil), sem precisar sair e entrar de novo.
  atualizarUsuario: (usuario: Usuario) => void;
}

const Contexto = createContext<ContextoAuth | null>(null);

export function useAuth(): ContextoAuth {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Protótipo: a sessão vem do storage local — sem rede, sem /me.
    setUsuario(authLib.obterSessao());
    setCarregando(false);

    const aoExpirar = () => {
      setUsuario(null);
      setCarregando(false);
    };
    window.addEventListener('rithmo:401', aoExpirar);
    return () => window.removeEventListener('rithmo:401', aoExpirar);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const sessao = await authLib.entrar(email, senha);
    if (sessao) setUsuario(sessao);
    return sessao;
  }, []);

  const registrar = useCallback(
    async (dados: { nome: string; email: string; senha: string; perfil: Perfil }) => {
      const sessao = await authLib.registrar(dados);
      setUsuario(sessao);
      return sessao;
    },
    [],
  );

  const sair = useCallback(() => {
    authLib.sair();
    setUsuario(null);
  }, []);

  // NOVO
  const atualizarUsuario = useCallback((atualizado: Usuario) => {
    salvarUsuarioSessao(atualizado);
    setUsuario(atualizado);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, registrar, sair, atualizarUsuario }),
    [usuario, carregando, entrar, registrar, sair, atualizarUsuario],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}