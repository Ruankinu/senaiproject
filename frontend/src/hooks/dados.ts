import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PacienteResumo,
  Progresso,
  ResumoPaciente,
  RotinaDia,
  Usuario,
} from '../types';
import * as rithmo from '../lib/rithmo';

interface Estado<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
}

interface Carregado<T> extends Estado<T> {
  recarregar: () => Promise<void>;
}

/**
 * Carregador com estado: mantém o `buscar` atual em uma ref para nunca
 * recriar o efeito a cada render (evita loop de requisições) e aceita
 * dependências explícitas para recarregar quando elas mudam.
 */
function useCarregar<T>(
  buscar: () => Promise<T>,
  dependencias: readonly unknown[] = [],
): Carregado<T> {
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  const [estado, setEstado] = useState<Estado<T>>({
    dados: null,
    carregando: true,
    erro: null,
  });

  const recarregar = useCallback(async () => {
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }));
    try {
      const dados = await buscarRef.current();
      setEstado({ dados, carregando: false, erro: null });
    } catch (e) {
      console.error('[dados] Falha ao carregar:', e);
      setEstado((atual) => ({
        ...atual,
        carregando: false,
        erro: 'Não foi possível carregar os dados.',
      }));
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void recarregar();
  }, [recarregar, ...dependencias]);

  return { ...estado, recarregar };
}

// ---- Paciente ----

export function useRotinaHoje() {
  return useCarregar(async () => (await rithmo.rotinaDoDia()).rotina);
}

export function useProgresso() {
  return useCarregar(async () => (await rithmo.obterProgresso()).progresso);
}

export function useVinculoPaciente() {
  const [psicologo, setPsicologo] = useState<Usuario['psicologoVinculado'] | null>(
    null,
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await rithmo.obterVinculo();
      setPsicologo(resposta.psicologo ?? null);
    } catch (e) {
      console.error('[vinculo] Falha ao carregar:', e);
      setErro('Não foi possível carregar seu vínculo.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const vincular = useCallback(
    async (codigo: string) => {
      const resposta = await rithmo.vincularPorCodigo(codigo);
      setPsicologo(resposta.psicologo ?? null);
    },
    [],
  );

  return { psicologo, carregando, erro, recarregar, vincular };
}

// ---- Psicólogo ----

export function usePacientes() {
  return useCarregar(async () => (await rithmo.listarPacientes()).pacientes);
}

export function usePacienteDetalhe(id: number, dia: string) {
  const resumo = useCarregar(
    async () => (await rithmo.obterResumoPaciente(id)).resumo,
    [id],
  );
  const rotina = useCarregar(
    async () => (await rithmo.obterRotinaPaciente(id, dia)).rotina,
    [id, dia],
  );
  return { resumo, rotina };
}

export type { PacienteResumo, Progresso, ResumoPaciente, RotinaDia, Usuario };
