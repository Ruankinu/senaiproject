import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Botao } from '../components/Botao';
import { Icone } from '../components/Icone';
import { useAuth } from '../context/AuthContext';
import { mensagemErro } from '../lib/errors';
import type { Perfil } from '../types';

const PERFIS: {
  id: Perfil;
  titulo: string;
  descricao: string;
  icone: string;
}[] = [
  {
    id: 'paciente',
    titulo: 'Paciente',
    descricao: 'Organize sua rotina.',
    icone: 'user',
  },
  {
    id: 'psicologo',
    titulo: 'Psicólogo',
    descricao: 'Acompanhe seus pacientes.',
    icone: 'users',
  },
];

export function PaginaRegistro() {
  const navigate = useNavigate();
  const { registrar } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!perfil) {
      setErro('Escolha como você usa o RITHMO.');
      return;
    }
    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha todos os campos.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const usuario = await registrar({ nome, email, senha, perfil });
      navigate(usuario.perfil === 'psicologo' ? '/psicologo' : '/', {
        replace: true,
      });
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível criar a conta'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__cartao">
        <Link to="/" className="marca marca--central" aria-label="RITHMO">
          <span className="marca__pulso" aria-hidden="true" />
          <span className="marca__nome">RITHMO</span>
        </Link>
        <p className="auth__tagline">Crie sua conta.</p>

        <div className="campo">
          <legend className="campo__legenda">Como você usa o RITHMO?</legend>
          <div className="perfil-cards" role="radiogroup" aria-label="Perfil">
            {PERFIS.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                role="radio"
                aria-checked={perfil === opcao.id}
                className={`perfil-card${perfil === opcao.id ? ' perfil-card--ativo' : ''}`}
                onClick={() => setPerfil(opcao.id)}
              >
                <span className="perfil-card__icone">
                  <Icone nome={opcao.icone} tamanho={18} />
                </span>
                <span className="perfil-card__texto">
                  <strong>{opcao.titulo}</strong>
                  <small>{opcao.descricao}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <form className="formulario" onSubmit={aoEnviar} noValidate>
          <div className="campo">
            <label htmlFor="campo-nome">Nome</label>
            <input
              id="campo-nome"
              type="text"
              value={nome}
              autoComplete="name"
              placeholder="Seu nome"
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="campo-email">E-mail</label>
            <input
              id="campo-email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="voce@exemplo.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="campo-senha">Senha</label>
            <input
              id="campo-senha"
              type="password"
              value={senha}
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && (
            <p className="formulario__erro" role="alert">
              {erro}
            </p>
          )}

          <Botao type="submit" carregando={enviando} className="botao-largo">
            Criar conta
          </Botao>
        </form>

        <p className="auth__rodape">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
