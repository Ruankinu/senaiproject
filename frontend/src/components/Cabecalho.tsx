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
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <header className="cabecalho">
      <Link
        to={usuario.perfil === 'psicologo' ? '/psicologo' : '/'}
        className="marca"
        aria-label="RITHMO"
      >
        <span className="marca__pulso" aria-hidden="true" />
        <span className="marca__nome">RITHMO</span>
      </Link>

      <div className="cabecalho__direita">
        {usuario.perfil === 'paciente' && streak > 0 && (
          <span className="streak-mini" title="Dias seguidos de consistência">
            <b>{streak}</b> dias
          </span>
        )}
        <span className="cabecalho__usuario">{primeiroNome}</span>
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
