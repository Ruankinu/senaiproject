export type Perfil = 'paciente' | 'psicologo';
export type Status = 'Pendente' | 'Concluída';
export type Prioridade = 'Baixa' | 'Média' | 'Alta';
export type Complexidade = 'Fácil' | 'Moderada' | 'Intensa';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  criadoEm?: string;
  codigo?: string | null;
  pacientesVinculados?: number;
  psicologoVinculado?: {
    id: number;
    nome: string;
    email: string;
    fotoUrl?: string | null; // NOVO
  } | null;
  fotoUrl?: string | null; // NOVO — foto de perfil (data URL, salva no back-end)
  // CIP do psicólogo (PDF ou foto). Só metadados — o arquivo é baixado sob demanda.
  documento?: {
    nome: string;
    tipo: string;
    tamanho: number;
    enviadoEm: string;
  } | null;
}

export interface Atividade {
  id: number;
  titulo: string;
  descricao: string | null;
  prazo: string;
  horario: string | null;
  prioridade: Prioridade;
  complexidade: Complexidade;
  status: Status;
  criadoEm: string;
  concluidaEm?: string | null;
}

export interface RotinaDia {
  data: string;
  total: number;
  concluidas: number;
  progresso: number;
  atividades: Atividade[];
}

export interface Badge {
  id: string;
  nome: string;
  meta: number;
  aberta: boolean;
  progresso: number;
}

export interface Progresso {
  streak: number;
  melhorStreak: number;
  badges: Badge[];
}

export interface DiaResumo {
  data: string;
  total: number;
  concluidas: number;
}

export interface ResumoPaciente {
  nome?: string | null; // NOVO
  email?: string | null; // NOVO
  hoje: { data: string; total: number; concluidas: number };
  atrasadas: number;
  ultimos7: DiaResumo[];
  progresso: Progresso;
}

export interface PacienteResumo {
  id: number;
  nome: string;
  email: string;
  fotoUrl?: string | null; // NOVO
  vinculadoEm: string;
  hoje: { data: string; total: number; concluidas: number };
  atrasadas: number;
  streak: number;
}

export const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta'];
export const COMPLEXIDADES: Complexidade[] = ['Fácil', 'Moderada', 'Intensa'];

export const ehConcluida = (atividade: Atividade): boolean =>
  atividade.status === 'Concluída';