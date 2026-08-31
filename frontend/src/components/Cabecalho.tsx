import { Link } from 'react-router-dom';
import { Icone } from './Icone';
import type { Usuario } from '../types';

interface CabecalhoProps {
  usuario: Usuario;
  streak?: number;
  onSair: () => void;
}

/**
 * Navegação mínima: marca à esquerda, contexto e saída à direita.
 * Sem sidebar — cada perfil tem uma tela principal.
 */
export function Cabecalho({ usuario, streak = 0, onSair }: CabecalhoProps) {
  return (
    <header className="cabecalho">
      <Link to={usuario.perfil === 'psicologo' ? '/psicologo' : '/'} className="marca" aria-label="RITHMO">
        <span className="marca__pulso" aria-hidden="true" />
        <span className="marca__nome">RITHMO</span>
      </Link>

      <div className="cabecalho__direita">
        <span className="cabecalho__usuario">{usuario.nome.split(' ')[0]}</span>
        {usuario.perfil === 'paciente' && streak > 0 && (
          <span className="chip-streak" title="Dias seguidos">
            <span className="ponto ponto--streak" aria-hidden="true" />
            {streak}
          </span>
        )}
        <button
          type="button"
          className="btn btn--icone"
          aria-label="Sair da conta"
          title="Sair"
          onClick={onSair}
        >
          <Icone nome="logout" tamanho={15} />
        </button>
      </div>
    </header>
  );
}
