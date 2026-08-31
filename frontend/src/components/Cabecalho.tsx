import { Link } from 'react-router-dom';
import { Botao } from './Botao';
import { Icone } from './Icone';

interface CabecalhoProps {
  onNovaTarefa?: () => void;
}

/**
 * Navegação mínima: marca à esquerda, ação principal à direita.
 * Sem sidebar — esta aplicação não precisa dela.
 */
export function Cabecalho({ onNovaTarefa }: CabecalhoProps) {
  return (
    <header className="cabecalho">
      <Link to="/" className="marca" aria-label="RITHMO — página inicial">
        <span className="marca__pulso" aria-hidden="true" />
        <span className="marca__nome">RITHMO</span>
      </Link>

      {onNovaTarefa ? (
        <Botao onClick={onNovaTarefa}>
          <Icone nome="plus" tamanho={14} />
          Nova tarefa
        </Botao>
      ) : (
        <Link to="/" className="btn btn--fantasma">
          <Icone nome="arrow-left" tamanho={14} />
          Tarefas
        </Link>
      )}
    </header>
  );
}
