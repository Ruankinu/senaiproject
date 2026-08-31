import { Link, NavLink } from 'react-router-dom';
import { Marca } from './Marca';
import { Icone } from './Icone';
import type { Usuario } from '../types';

interface CabecalhoProps {
  usuario: Usuario;
  onSair: () => void;
}

/**
 * Navegação do produto: marca à esquerda, destino atual em destaque e
 * identidade + saída à direita. Cada perfil tem sua própria arquitetura.
 */
export function Cabecalho({ usuario, onSair }: CabecalhoProps) {
  const primeiroNome = usuario.nome.split(' ')[0];
  const itens =
    usuario.perfil === 'psicologo'
      ? [
          { to: '/psicologo', rotulo: 'Pacientes' },
          { to: '/perfil', rotulo: 'Perfil' },
        ]
      : [
          { to: '/', rotulo: 'Hoje' },
          { to: '/perfil', rotulo: 'Perfil' },
        ];

  return (
    <header className="cabecalho">
      <Link to={itens[0].to} className="cabecalho__marca" aria-label="RITHMO — início">
        <Marca lockup={false} tamanho="pequena" />
      </Link>

      <nav className="cabecalho__nav" aria-label="Navegação principal">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/' || item.to === '/psicologo'}
            className={({ isActive }) =>
              `cabecalho__link${isActive ? ' cabecalho__link--ativo' : ''}`
            }
          >
            {item.rotulo}
          </NavLink>
        ))}
      </nav>

      <div className="cabecalho__direita">
        <span className="cabecalho__usuario">
          <span className="cabecalho__usuario-ponto" aria-hidden="true" />
          {primeiroNome}
        </span>
        <button
          type="button"
          className="btn btn--icone"
          aria-label="Sair da conta"
          title="Sair"
          onClick={onSair}
        >
          <Icone nome="logout" tamanho={16} />
        </button>
      </div>
    </header>
  );
}
