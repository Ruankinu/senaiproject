import { Link } from 'react-router-dom';
import type { Tarefa } from '../types/task';
import { ehConcluida } from '../types/task';
import { rotuloPrazo } from '../lib/dates';
import { Icone } from './Icone';

interface LinhaTarefaProps {
  tarefa: Tarefa;
  onAlternar: (tarefa: Tarefa) => void;
  onExcluir: (tarefa: Tarefa) => void;
}

/**
 * Item de lista em formato de linha (não card): título em primeiro plano,
 * descrição secundária, prazo e prioridade como metadados, ações discretas.
 */
export function LinhaTarefa({ tarefa, onAlternar, onExcluir }: LinhaTarefaProps) {
  const concluida = ehConcluida(tarefa);
  const prazo = rotuloPrazo(tarefa);
  const id = String(tarefa.id);

  const prioridadeSlug = tarefa.prioridade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    <article className={`tarefa${concluida ? ' tarefa--concluida' : ''}`}>
      <div className="tarefa__check">
        <input
          type="checkbox"
          className="tarefa__checkbox"
          checked={concluida}
          aria-label={
            concluida
              ? `Reabrir tarefa: ${tarefa.titulo}`
              : `Concluir tarefa: ${tarefa.titulo}`
          }
          onChange={() => onAlternar(tarefa)}
        />
      </div>

      <div className="tarefa__corpo">
        <Link to={`/editar/${id}`} className="tarefa__titulo">
          {tarefa.titulo}
        </Link>
        <p className="tarefa__descricao">{tarefa.tarefa}</p>
      </div>

      <div className="tarefa__prazo">
        {concluida ? (
          <span className="tarefa__concluida">
            <Icone nome="check" tamanho={12} />
            Concluída
          </span>
        ) : (
          <span className={`tarefa__prazo-rotulo tarefa__prazo--${prazo.tom}`}>
            {prazo.rotulo}
          </span>
        )}
      </div>

      <div className="tarefa__prioridade">
        <span
          className={`prioridade prioridade--${prioridadeSlug}`}
          title={`Prioridade ${tarefa.prioridade}`}
        >
          <i className="ponto" aria-hidden="true" />
          {tarefa.prioridade}
        </span>
      </div>

      <div className="tarefa__acoes">
        <Link
          to={`/editar/${id}`}
          className="btn btn--icone"
          aria-label={`Editar tarefa: ${tarefa.titulo}`}
          title="Editar"
        >
          <Icone nome="pencil" tamanho={15} />
        </Link>
        <button
          type="button"
          className="btn btn--icone btn--perigo-suave"
          aria-label={`Excluir tarefa: ${tarefa.titulo}`}
          title="Excluir"
          onClick={() => onExcluir(tarefa)}
        >
          <Icone nome="trash" tamanho={15} />
        </button>
      </div>
    </article>
  );
}
