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
    let timer: number | undefined;

    /**
     * Boot com retry: sem token → login imediato; /me 401 → login com token
     * limpo; falha transitória (rede/5xx) → continua em "carregando" e tenta
     * de novo, em vez de tratar "ainda não verificado" como "não autenticado"
     * e expulsar um usuário com sessão válida para o login.
     */
    async function tentarRestaurar(tentativa: number) {
      try {
        const sessao = await authLib.obterSessao();
        if (!ativo) return;
        setUsuario(sessao);
        setCarregando(false);
      } catch {
        if (!ativo) return;
        const atraso =
          tentativa < 3 ? tentativa * 1200 + 1200 : 8000;
        timer = window.setTimeout(() => {
          void tentarRestaurar(tentativa + 1);
        }, atraso);
      }
    }

    void tentarRestaurar(1);

    const aoExpirar = () => {
      setUsuario(null);
      setCarregando(false);
    };
    window.addEventListener('rithmo:401', aoExpirar);
    return () => {
      ativo = false;
      if (timer !== undefined) window.clearTimeout(timer);
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
