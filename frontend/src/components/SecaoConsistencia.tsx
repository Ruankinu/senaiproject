import { Icone } from './Icone';
import type { Progresso } from '../types';
import { pluralizar } from '../lib/dates';

interface SecaoConsistenciaProps {
  progresso: Progresso;
}

/**
 * Consistência como parte natural da rotina: um número sóbrio + conquistas
 * com identidade própria (sem emoji de medalha, sem festa visual).
 */
export function SecaoConsistencia({ progresso }: SecaoConsistenciaProps) {
  const { streak, melhorStreak, badges } = progresso;

  return (
    <section className="secao" aria-label="Sua consistência">
      <header className="secao__cabecalho">
        <div>
          <h2 className="secao__titulo">Consistência</h2>
          <p className="secao__legenda">
            Um dia de cada vez — cada dia concluído faz a sequência crescer.
          </p>
        </div>
      </header>

      <div className="consistencia__numero">
        <span className="consistencia__dias">{streak}</span>
        <span className="consistencia__unidade">
          {pluralizar(streak, 'dia', 'dias')} de consistência
        </span>
        {melhorStreak > streak && melhorStreak > 0 && (
          <span className="consistencia__melhor">
            melhor sequência: {melhorStreak}
          </span>
        )}
      </div>

      <ul className="badges">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className={`badge${badge.aberta ? ' badge--aberta' : ''}`}
          >
            <span className="badge__marca" aria-hidden="true">
              {badge.aberta ? <Icone nome="check" tamanho={12} /> : null}
            </span>
            <span className="badge__nome">{badge.nome}</span>
            <span className="badge__progresso">
              {badge.aberta
                ? 'Desbloqueada'
                : `${badge.progresso}/${badge.meta} dias`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
