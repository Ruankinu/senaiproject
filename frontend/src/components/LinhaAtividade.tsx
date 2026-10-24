import { Icone } from './Icone';
import { MedidorComplexidade } from './MedidorComplexidade';
import type { Atividade } from '../types';
import { ehConcluida } from '../types';

interface LinhaAtividadeProps {
  atividade: Atividade;
  somenteLeitura?: boolean;
  // NOVO — modo de seleção em massa: troca o checkbox de "concluir" por
  // um de "selecionar", e esconde os botões de editar/excluir individuais
  // (que ficam redundantes com a barra de ações em massa).
  selecionavel?: boolean;
  selecionada?: boolean;
  onSelecionar?: (atividade: Atividade) => void;
  onAlternar?: (atividade: Atividade) => void;
  onEditar?: (atividade: Atividade) => void;
  onExcluir?: (atividade: Atividade) => void;
}



/**
 * Item da rotina na pauta: o horário é numeral de relógio à esquerda,
 * separado por uma régua vertical; título/descrição/metadados no corpo;
 * a conclusão é a ação principal.
 */
export function LinhaAtividade({
  atividade,
  somenteLeitura = false,
  selecionavel = false,
  selecionada = false,
  onSelecionar,
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
      className={`linha${concluida ? ' linha--feita' : ''}${
        selecionada ? ' linha--selecionada' : ''
      }`}
    >
      <div className="linha__check">
        {selecionavel ? (
          <input
            type="checkbox"
            className="linha__checkbox"
            checked={selecionada}
            aria-label={`Selecionar atividade: ${atividade.titulo}`}
            onChange={() => onSelecionar?.(atividade)}
          />
        ) : somenteLeitura ? (
          <span
            className={`linha__status-dot${
              concluida ? ' linha__status-dot--feita' : ''
            }`}
            aria-label={concluida ? 'Concluída' : 'Pendente'}
          />
        ) : (
          <input
            type="checkbox"
            className="linha__checkbox"
            checked={concluida}
            aria-label={
              concluida
                ? `Reabrir atividade: ${atividade.titulo}`
                : `Concluir atividade: ${atividade.titulo}`
            }
            onChange={() => onAlternar?.(atividade)}
          />
        )}
      </div>

      <div className="linha__tempo">{atividade.horario ?? '—'}</div>

      <div className="linha__corpo">
        <h3 className="linha__titulo">{atividade.titulo}</h3>
        {atividade.descricao && (
          <p className="linha__descricao">{atividade.descricao}</p>
        )}
        <div className="linha__meta">
          <span
            className={`prioridade prioridade--${prioridadeSlug}`}
            title={`Prioridade ${atividade.prioridade}`}
          >
            <i className="ponto" aria-hidden="true" />
            {atividade.prioridade}
          </span>
          <MedidorComplexidade nivel={atividade.complexidade} comRotulo />
        </div>
      </div>

      {!somenteLeitura && !selecionavel && (
        <div className="linha__acoes">
          <button
            type="button"
            className="btn btn--icone"
            aria-label={`Editar atividade: ${atividade.titulo}`}
            title="Editar"
            onClick={() => onEditar?.(atividade)}
          >
            <Icone nome="pencil" tamanho={15} />
          </button>
          <button
            type="button"
            className="btn btn--icone btn--perigo-suave"
            aria-label={`Excluir atividade: ${atividade.titulo}`}
            title="Excluir"
            onClick={() => onExcluir?.(atividade)}
          >
            <Icone nome="trash" tamanho={15} />
          </button>
        </div>
      )}
    </article>
  );
}