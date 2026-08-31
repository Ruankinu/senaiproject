import { api } from './api';
import type { ListaTarefasResponse, Tarefa, TarefaPayload } from '../types/task';

export const listarTarefas = () =>
  api.get<ListaTarefasResponse>('/');

export const buscarTarefa = (id: string) =>
  api.get<{ tarefa: Tarefa }>(`/${encodeURIComponent(id)}`);

export const criarTarefa = (dados: TarefaPayload) =>
  api.post<{ mensagem: string; tarefa: Tarefa }>('/cadastrarTarefa', dados);

export const atualizarTarefa = (id: string, dados: Partial<TarefaPayload>) =>
  api.put<{ mensagem: string; tarefa: Tarefa }>(`/${encodeURIComponent(id)}`, dados);

export const excluirTarefa = (id: string) =>
  api.delete<{ mensagem: string }>(`/${encodeURIComponent(id)}`);

export const concluirTarefa = (id: string) =>
  api.patch<{ mensagem: string; tarefa: Tarefa }>(
    `/${encodeURIComponent(id)}/concluir`,
  );
