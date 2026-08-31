import { Link } from 'react-router-dom';
import { Icone } from './Icone';
import type { Usuario } from '../types';

interface CabecalhoProps {
  usuario: Usuario;
  streak?: number;
  onSair: () => void;
}

/**
 * Barra superior do produto: marca à esquerda, contexto e saída à direita.
 * Nota: o streak agora vive na coluna de ritmo da Home — aqui só contexto.
 */
export function Cabecalho({ usuario, onSair }: CabecalhoProps) {
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
        <span className="cabecalho__data">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          })}
        </span>
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
