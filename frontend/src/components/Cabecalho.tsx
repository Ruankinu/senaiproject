import { Link, NavLink } from 'react-router-dom';
import { Icone } from './Icone';
import { useTema } from '../hooks/tema';
import { primeiroNome } from '../lib/nomes';
import type { Usuario } from '../types';

interface CabecalhoProps {
  usuario: Usuario;
  streak?: number;
  onSair: () => void;
}

/**
 * Cabeçalho padrão de site: logo à esquerda, links de navegação no centro
 * (mudam conforme o perfil) e ações do usuário à direita.
 */
export function Cabecalho({ usuario, onSair }: CabecalhoProps) {
  const ehPsicologo = usuario.perfil === 'psicologo';
  const { escuroAtivo, alternar } = useTema();

  const links = ehPsicologo
    ? [
        { to: '/psicologo', rotulo: 'Pacientes' },
        { to: '/perfil', rotulo: 'Meu perfil' },
      ]
    : [
        { to: '/', rotulo: 'Minha rotina' },
        { to: '/perfil', rotulo: 'Meu perfil' },
      ];

  return (
    <header className="cabecalho">
      <div className="cabecalho__interno">
        <Link
          to={ehPsicologo ? '/psicologo' : '/'}
          className="marca"
          aria-label="RITHMO — página inicial"
        >
          <img src="/logo-icone.png" alt="" className="marca__icone" />
          <span className="marca__nome">RITHMO</span>
        </Link>

        <nav className="cabecalho__nav" aria-label="Principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/psicologo'}
              className={({ isActive }) =>
                `cabecalho__link${isActive ? ' is-ativo' : ''}`
              }
            >
              {link.rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="cabecalho__direita">
          <Link to="/perfil" className="cabecalho__usuario" title="Meu perfil">
            <span className="cabecalho__avatar" aria-hidden="true">
              {usuario.fotoUrl ? (
                <img src={usuario.fotoUrl} alt="" />
              ) : (
                primeiroNome(usuario.nome).charAt(0).toUpperCase()
              )}
            </span>
            <span className="cabecalho__nome-usuario">
              {primeiroNome(usuario.nome)}
            </span>
          </Link>
          <button
            type="button"
            className="btn btn--icone"
            aria-label={escuroAtivo ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            title={escuroAtivo ? 'Modo claro' : 'Modo escuro'}
            onClick={alternar}
          >
            <Icone nome={escuroAtivo ? 'sol' : 'lua'} tamanho={16} />
          </button>
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
      </div>
    </header>
  );
}
