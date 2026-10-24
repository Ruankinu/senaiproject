import { api, baixarArquivo } from './api';
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

export const listarAtividades = () =>
  api.get<{ quantidade: number; atividades: Atividade[] }>('/atividades');

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

// NOVO — foto de perfil. Envie null pra remover.
export const atualizarFotoPerfil = (fotoUrl: string | null) =>
  api.patch<{ usuario: Usuario }>('/me/foto', { fotoUrl });

// NOVO — dados atualizados do próprio usuário (código, pacientes
// vinculados, psicólogo vinculado...). A sessão salva localmente não
// tem esses números, só o que veio no login; isso busca a versão atual.
export const obterMeuPerfil = () => api.get<{ usuario: Usuario }>('/me');

// NOVO — editar nome e/ou e-mail. Manda só o que mudou.
export const atualizarPerfil = (dados: { nome?: string; email?: string }) =>
  api.patch<{ usuario: Usuario }>('/me', dados);

// NOVO — trocar a senha (o back exige a senha atual pra confirmar).
export const alterarSenha = (dados: { senhaAtual: string; novaSenha: string }) =>
  api.patch<{ mensagem: string }>('/me/senha', dados);

// ---- CIP (carteira de identidade profissional do CRP) — só psicólogo ----

export const enviarDocumentoCip = (dataUrl: string, nomeArquivo: string) =>
  api.post<{ documento: NonNullable<Usuario['documento']> }>('/me/documento', {
    dataUrl,
    nomeArquivo,
  });

export const removerDocumentoCip = () =>
  api.delete<{ mensagem: string }>('/me/documento');

export const baixarDocumentoCip = () => baixarArquivo('/me/documento');

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