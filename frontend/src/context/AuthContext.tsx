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

interface ContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<Usuario>;
  registrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    perfil: Perfil;
  }) => Promise<Usuario>;
  sair: () => void;
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
    let ativo = true;
    authLib
      .obterSessao()
      .then((sessao) => {
        if (ativo) setUsuario(sessao);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    const aoExpirar = () => setUsuario(null);
    window.addEventListener('rithmo:401', aoExpirar);
    return () => {
      ativo = false;
      window.removeEventListener('rithmo:401', aoExpirar);
    };
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const sessao = await authLib.entrar(email, senha);
    setUsuario(sessao);
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

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, registrar, sair }),
    [usuario, carregando, entrar, registrar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
