import type { Atividade } from '../types';
import { ehConcluida } from '../types';

interface LinhaAtividadeProps {
  atividade: Atividade;
  somenteLeitura?: boolean;
  onAlternar?: (atividade: Atividade) => void;
  onEditar?: (atividade: Atividade) => void;
  onExcluir?: (atividade: Atividade) => void;
}

function PontosComplexidade({ nivel }: { nivel: string }) {
  const quantidade =
    nivel === 'Intensa' ? 3 : nivel === 'Moderada' ? 2 : 1;
  return (
    <span
      className="complexidade"
      role="img"
      aria-label={`Complexidade ${nivel}`}
      title={`Complexidade ${nivel}`}
    >
      {[0, 1, 2].map((indice) => (
        <i
          key={indice}
          className={indice < quantidade ? 'cheio' : ''}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/**
 * Item de rotina em formato de linha com eixo temporal (horário à esquerda).
 * Ações discretas no hover (sempre visíveis em telas de toque).
 */
export function LinhaAtividade({
  atividade,
  somenteLeitura = false,
  onAlternar,
  onEditar,
  onExcluir,
}: LinhaAtividadeProps) {
  const concluida = ehConcluida(atividade);
  const prioridadeSlug = atividade.prioridade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    <article
      className={`atividade${concluida ? ' atividade--concluida' : ''}`}
    >
      {!somenteLeitura && (
        <div className="atividade__check">
          <input
            type="checkbox"
            className="atividade__checkbox"
            checked={concluida}
            aria-label={
              concluida
                ? `Reabrir atividade: ${atividade.titulo}`
                : `Concluir atividade: ${atividade.titulo}`
            }
            onChange={() => onAlternar?.(atividade)}
          />
        </div>
      )}

      <div className="atividade__horario" aria-label={`às ${atividade.horario ?? 'sem horário definido'}`}>
        {atividade.horario ?? '—'}
      </div>

      <div className="atividade__corpo">
        <h3 className="atividade__titulo">{atividade.titulo}</h3>
        {atividade.descricao && (
          <p className="atividade__descricao">{atividade.descricao}</p>
        )}
      </div>

      <div className="atividade__meta">
        <span
          className={`prioridade prioridade--${prioridadeSlug}`}
          title={`Prioridade ${atividade.prioridade}`}
        >
          <i className="ponto" aria-hidden="true" />
          {atividade.prioridade}
        </span>
        <PontosComplexidade nivel={atividade.complexidade} />
      </div>

      {somenteLeitura ? (
        <div className="atividade__status">
          {concluida ? (
            <span className="atividade__concluida">Concluída</span>
          ) : (
            <span className="atividade__pendente">Pendente</span>
          )}
        </div>
      ) : (
        <div className="atividade__acoes">
          <button
            type="button"
            className="btn btn--icone"
            aria-label={`Editar atividade: ${atividade.titulo}`}
            title="Editar"
            onClick={() => onEditar?.(atividade)}
          >
            <IconeEditar />
          </button>
          <button
            type="button"
            className="btn btn--icone btn--perigo-suave"
            aria-label={`Excluir atividade: ${atividade.titulo}`}
            title="Excluir"
            onClick={() => onExcluir?.(atividade)}
          >
            <IconeLixeira />
          </button>
        </div>
      )}
    </article>
  );
}

import { Icone } from './Icone';

function IconeEditar() {
  return <Icone nome="pencil" tamanho={15} />;
}

function IconeLixeira() {
  return <Icone nome="trash" tamanho={15} />;
}
