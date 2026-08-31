import { api } from './api';
import type {
  Atividade,
  PacienteResumo,
  Progresso,
  ResumoPaciente,
  RotinaDia,
  Usuario,
} from '../types';

export interface DadosAtividade {
  titulo: string;
  descricao: string;
  prazo: string;
  horario: string;
  prioridade: string;
  complexidade: string;
}

// ---- Rotina (paciente) ----

export const criarAtividade = (dados: DadosAtividade) =>
  api.post<{ mensagem: string; atividade: Atividade }>('/atividades', dados);

export const atualizarAtividade = (id: number, dados: Partial<DadosAtividade>) =>
  api.put<{ mensagem: string; atividade: Atividade }>(
    `/atividades/${id}`,
    dados,
  );

export const excluirAtividade = (id: number) =>
  api.delete<{ mensagem: string }>(`/atividades/${id}`);

export const alternarConclusao = (id: number) =>
  api.patch<{ mensagem: string; atividade: Atividade }>(
    `/atividades/${id}/concluir`,
  );

export const rotinaDoDia = (data?: string) =>
  api.get<{ rotina: RotinaDia }>(
    data ? `/rotina/hoje?data=${encodeURIComponent(data)}` : '/rotina/hoje',
  );

export const obterProgresso = () =>
  api.get<{ progresso: Progresso }>('/progresso');

// ---- Vínculo ----

export const obterVinculo = () =>
  api.get<{ psicologo: Usuario['psicologoVinculado']; codigo?: string | null }>(
    '/vinculo',
  );

export const vincularPorCodigo = (codigo: string) =>
  api.post<{ mensagem: string; psicologo: Usuario['psicologoVinculado'] }>(
    '/vinculo',
    { codigo },
  );

// ---- Psicólogo ----

export const listarPacientes = () =>
  api.get<{ pacientes: PacienteResumo[] }>('/pacientes');

export const obterResumoPaciente = (id: number) =>
  api.get<{ resumo: ResumoPaciente }>(`/pacientes/${id}/resumo`);

export const obterRotinaPaciente = (id: number, data?: string) =>
  api.get<{ rotina: RotinaDia }>(
    data
      ? `/pacientes/${id}/rotina?data=${encodeURIComponent(data)}`
      : `/pacientes/${id}/rotina`,
  );
