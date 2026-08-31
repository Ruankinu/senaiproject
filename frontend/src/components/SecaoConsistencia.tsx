import { Link } from 'react-router-dom';
import { Icone } from './Icone';
import type { Progresso } from '../types';
import { pluralizar } from '../lib/dates';

interface SecaoConsistenciaProps {
  progresso: Progresso;
}

/**
 * Consistência na Home: número sóbrio + somente as conquistas JÁ
 * desbloqueadas (sem revelar condições de itens futuros). O acervo
 * completo mora no Perfil.
 */
export function SecaoConsistencia({ progresso }: SecaoConsistenciaProps) {
  const { streak, melhorStreak, badges } = progresso;
  const conquistadas = badges.filter((badge) => badge.aberta);

  return (
    <section className="cartao apoio-card" aria-label="Sua consistência">
      <span className="apoio-card__rotulo">Consistência</span>

      <div className="consistencia">
        <span className="consistencia__numero">{streak}</span>
        <span className="consistencia__texto">
          {pluralizar(streak, 'dia', 'dias')} de ritmo
        </span>
        {melhorStreak > streak && melhorStreak > 0 && (
          <span className="consistencia__extra">
            melhor sequência: {melhorStreak} dias
          </span>
        )}
      </div>

      {conquistadas.length > 0 && (
        <>
          <span className="apoio-card__rotulo" style={{ marginTop: 18 }}>
            Conquistas
          </span>
          <ul className="conquistas-mini" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {conquistadas.map((badge) => (
              <li key={badge.id} className="conquista-chip">
                <span className="conquista-chip__icone conquista-chip__icone--verde">
                  <Icone nome="check" tamanho={12} />
                </span>
                <span className="conquista-chip__nome">{badge.nome}</span>
              </li>
            ))}
          </ul>
          <Link to="/perfil" className="ver-mais">
            Ver todas
            <Icone nome="chevron-right" tamanho={12} />
          </Link>
        </>
      )}
    </section>
  );
}
