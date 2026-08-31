import type { Tarefa } from '../types/task';
import { ehConcluida } from '../types/task';
import { diferencaDias, pluralizar } from '../lib/dates';

interface ResumoProps {
  tarefas: Tarefa[];
}

/**
 * Linha de contexto: quantas tarefas existem, quantas exigem atenção hoje
 * e quantas estão atrasadas — derivadas apenas dos dados reais.
 */
export function Resumo({ tarefas }: ResumoProps) {
  const abertas = tarefas.filter((t) => !ehConcluida(t));
  const hoje = abertas.filter((t) => diferencaDias(t.prazo) === 0).length;
  const atrasadas = abertas.filter((t) => (diferencaDias(t.prazo) ?? 0) < 0).length;

  const partes: string[] = [];
  partes.push(
    `${tarefas.length} ${pluralizar(tarefas.length, 'tarefa', 'tarefas')}`,
  );
  if (hoje > 0) {
    partes.push(`${hoje} para hoje`);
  }
  if (atrasadas > 0) {
    partes.push(
      `${atrasadas} ${pluralizar(atrasadas, 'atrasada', 'atrasadas')}`,
    );
  }

  return (
    <p className="resumo">
      {partes.join(' · ')}
      {atrasadas === 0 && tarefas.length > 0 && (
        <span className="resumo__tranquilo"> · tudo em dia</span>
      )}
    </p>
  );
}
