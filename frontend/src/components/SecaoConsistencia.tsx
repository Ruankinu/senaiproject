import { Icone } from './Icone';
import type { Progresso } from '../types';
import { pluralizar } from '../lib/dates';

interface SecaoConsistenciaProps {
  progresso: Progresso;
}

/**
 * Coluna de apoio da Home: o ritmo em um número sóbrio + conquistas como
 * selos colecionáveis (sinete, nome e progresso) — nunca emoji ou festa.
 */
export function SecaoConsistencia({ progresso }: SecaoConsistenciaProps) {
  const { streak, melhorStreak, badges } = progresso;

  return (
    <section className="ritmo-bloco" aria-label="Sua consistência">
      <span className="ritmo-bloco__rotulo">Seu ritmo</span>

      <div className="ritmo-metrica">
        <span className="ritmo-metrica__numero">{streak}</span>
        <span className="ritmo-metrica__texto">
          {pluralizar(streak, 'dia', 'dias')} de consistência
        </span>
        {melhorStreak > streak && melhorStreak > 0 && (
          <span className="ritmo-metrica__extra">
            melhor sequência: {melhorStreak} dias
          </span>
        )}
      </div>

      <span className="ritmo-bloco__rotulo" style={{ marginTop: 22 }}>
        Conquistas
      </span>
      <ul className="selos">
        {badges.map((badge) => (
          <li
            key={badge.id}
            className={`selo${badge.aberta ? ' selo--aberta' : ''}`}
          >
            <span className="selo__sinete" aria-hidden="true">
              {badge.aberta ? <Icone nome="check" tamanho={12} /> : null}
            </span>
            <span className="selo__nome">{badge.nome}</span>
            <span className="selo__progresso">
              {badge.aberta
                ? 'OK'
                : `${badge.progresso}/${badge.meta}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
