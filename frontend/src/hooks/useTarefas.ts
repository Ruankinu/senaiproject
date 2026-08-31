import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tarefa, TarefaPayload } from '../types/task';
import { ehConcluida } from '../types/task';
import {
  atualizarTarefa,
  buscarTarefa,
  concluirTarefa,
  criarTarefa,
  excluirTarefa,
  listarTarefas,
} from '../lib/tasks';

interface EstadoTarefas {
  tarefas: Tarefa[];
  carregando: boolean;
  erro: string | null;
}

export interface AcaoTarefas {
  recarregar: () => Promise<void>;
  criar: (dados: TarefaPayload) => Promise<Tarefa>;
  atualizar: (id: string, dados: Partial<TarefaPayload>) => Promise<Tarefa>;
  alternarConclusao: (tarefa: Tarefa) => Promise<void>;
  excluir: (tarefa: Tarefa) => Promise<void>;
}

export function useTarefas(): EstadoTarefas & AcaoTarefas {
  const [estado, setEstado] = useState<EstadoTarefas>({
    tarefas: [],
    carregando: true,
    erro: null,
  });

  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const recarregar = useCallback(async () => {
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }));
    try {
      const resposta = await listarTarefas();
      if (!montado.current) return;
      setEstado({
        tarefas: resposta.tarefas ?? [],
        carregando: false,
        erro: null,
      });
    } catch (erro) {
      if (!montado.current) return;
      console.error('[tarefas] Falha ao carregar lista:', erro);
      setEstado((atual) => ({
        ...atual,
        carregando: false,
        erro: 'Não foi possível carregar suas tarefas.',
      }));
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const aplicarLocalmente = useCallback((tarefa: Tarefa) => {
    setEstado((atual) => ({
      ...atual,
      tarefas: atual.tarefas.map((item) =>
        String(item.id) === String(tarefa.id) ? tarefa : item,
      ),
    }));
  }, []);

  const criar = useCallback(
    async (dados: TarefaPayload) => {
      const resposta = await criarTarefa(dados);
      // Recarrega para obter o id real gerado pelo banco.
      await recarregar();
      return resposta.tarefa;
    },
    [recarregar],
  );

  const atualizar = useCallback(
    async (id: string, dados: Partial<TarefaPayload>) => {
      const resposta = await atualizarTarefa(id, dados);
      aplicarLocalmente(resposta.tarefa);
      return resposta.tarefa;
    },
    [aplicarLocalmente],
  );

  const alternarConclusao = useCallback(
    async (tarefa: Tarefa) => {
      const id = String(tarefa.id);
      const estavaConcluida = ehConcluida(tarefa);
      const agoraConcluida = !estavaConcluida;

      // Atualização otimista: a interface responde imediatamente.
      const otimista: Tarefa = {
        ...tarefa,
        status: agoraConcluida ? 'Concluída' : 'Pendente',
      };
      aplicarLocalmente(otimista);

      try {
        if (agoraConcluida) {
          const resposta = await concluirTarefa(id);
          aplicarLocalmente(resposta.tarefa);
        } else {
          // A rota PATCH apenas conclui; para reabrir usamos PUT com status.
          const resposta = await atualizarTarefa(id, { status: 'Pendente' });
          aplicarLocalmente(resposta.tarefa);
        }
      } catch (erro) {
        aplicarLocalmente(tarefa); // reverte a mudança otimista
        throw erro;
      }
    },
    [aplicarLocalmente],
  );

  const excluir = useCallback(
    async (tarefa: Tarefa) => {
      const id = String(tarefa.id);
      setEstado((atual) => ({
        ...atual,
        tarefas: atual.tarefas.filter((item) => String(item.id) !== id),
      }));
      try {
        await excluirTarefa(id);
      } catch (erro) {
        await recarregar();
        throw erro;
      }
    },
    [recarregar],
  );

  return { ...estado, recarregar, criar, atualizar, alternarConclusao, excluir };
}

/** Busca uma tarefa individual (usada pela tela de edição). */
export function useBuscarTarefa(id: string | undefined) {
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);

  useEffect(() => {
    if (!id) {
      setNaoEncontrada(true);
      setCarregando(false);
      return;
    }
    let ativo = true;
    setCarregando(true);
    setNaoEncontrada(false);
    buscarTarefa(id)
      .then((resposta) => {
        if (!ativo) return;
        setTarefa(resposta.tarefa);
      })
      .catch((erro) => {
        if (!ativo) return;
        console.error('[tarefas] Falha ao buscar tarefa:', erro);
        setTarefa(null);
        setNaoEncontrada(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  return { tarefa, carregando, naoEncontrada };
}
