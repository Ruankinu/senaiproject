export type Prioridade = 'Baixa' | 'Média' | 'Alta';
export type Status = 'Pendente' | 'Concluída';

export interface Tarefa {
  id: number | string;
  titulo: string;
  tarefa: string;
  prazo: string;
  prioridade: string;
  status: string;
  criado_em?: string | null;
}

export interface TarefaPayload {
  titulo: string;
  tarefa: string;
  prazo: string;
  prioridade: string;
  status?: string;
}

export interface ListaTarefasResponse {
  quantidade: number;
  tarefas: Tarefa[];
}

export const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta'];
export const STATUS: Status[] = ['Pendente', 'Concluída'];

export const ehConcluida = (tarefa: Tarefa): boolean =>
  tarefa.status?.trim().toLowerCase() === 'concluída';
