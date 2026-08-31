import type { Tarefa } from '../types/task';

/**
 * O backend armazena o prazo como "AAAA-MM-DD". Normaliza para uma data
 * local (sem fusos) para que os rótulos "Hoje", "Amanhã" etc. sejam exatos.
 */
export function parseDataPrazo(prazo: string): Date | null {
  const partes = prazo?.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) return null;
  const [, ano, mes, dia] = partes;
  return new Date(Number(ano), Number(mes) - 1, Number(dia));
}

export function hojeLocal(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

export function diferencaDias(prazo: string): number | null {
  const data = parseDataPrazo(prazo);
  if (!data) return null;
  const hoje = hojeLocal().getTime();
  return Math.round((data.getTime() - hoje) / 86_400_000);
}

export function formatarData(prazo: string): string {
  const data = parseDataPrazo(prazo);
  if (!data) return prazo;
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

export function formatarCriacao(criadoEm?: string | null): string {
  if (!criadoEm) return '—';
  // Aceita "2026-08-31 16:50:49" (SQLite) e ISO "2026-08-31T16:50:49.000Z" (MySQL).
  const data = new Date(
    criadoEm.includes('T') ? criadoEm : criadoEm.replace(' ', 'T'),
  );
  if (Number.isNaN(data.getTime())) return criadoEm;
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export type TomPrazo = 'atrasada' | 'hoje' | 'amanha' | 'em-breve' | 'futuro';

export interface RotuloPrazo {
  rotulo: string;
  tom: TomPrazo;
}

/** Rótulo contextual do prazo, derivado apenas dos dados da tarefa. */
export function rotuloPrazo(tarefa: Tarefa): RotuloPrazo {
  const dias = diferencaDias(tarefa.prazo);
  const data = formatarData(tarefa.prazo);

  if (dias === null) return { rotulo: data, tom: 'futuro' };
  if (dias < 0) return { rotulo: `Atrasada · ${data}`, tom: 'atrasada' };
  if (dias === 0) return { rotulo: `Hoje · ${data}`, tom: 'hoje' };
  if (dias === 1) return { rotulo: `Amanhã · ${data}`, tom: 'amanha' };
  if (dias <= 3) return { rotulo: `Em breve · ${data}`, tom: 'em-breve' };
  return { rotulo: data, tom: 'futuro' };
}

export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string,
): string {
  return quantidade === 1 ? singular : plural;
}
