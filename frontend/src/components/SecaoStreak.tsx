import { Icone } from './Icone';
import type { Progresso } from '../types';
import { pluralizar } from '../lib/dates';

interface SecaoStreakProps {
  progresso: Progresso;
}

/**
 * Consistência com tom motivador (sem linguagem de punição): streak atual,
 * melhor sequência e conquistas com progresso real.
 */
export function SecaoStreak({ progresso }: SecaoStreakProps) {
  return (
    <section className="secao" aria-label="Sua consistência">
      <header className="secao__cabecalho">
        <h2 className="secao__titulo">Consistência</h2>
        <p className="secao__meta">
          {progresso.streak > 0
            ? `${progresso.streak} ${pluralizar(progresso.streak, 'dia', 'dias')} seguidos`
            : 'Sua próxima sequência começa hoje'}
          {progresso.melhorStreak > progresso.streak &&
            ` · melhor: ${progresso.melhorStreak}`}
        </p>
      </header>

      <ul className="badges">
        {progresso.badges.map((badge) => (
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
