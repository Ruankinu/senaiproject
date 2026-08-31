import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Botao } from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import { mensagemErro } from '../lib/errors';
import type { Perfil } from '../types';

const PERFIS: { id: Perfil; titulo: string; descricao: string }[] = [
  {
    id: 'paciente',
    titulo: 'Sou paciente',
    descricao: 'Organizo minha própria rotina, um dia de cada vez.',
  },
  {
    id: 'psicologo',
    titulo: 'Sou psicólogo',
    descricao: 'Acompanho a rotina e a consistência dos meus pacientes.',
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
    <main className="acesso">
      <aside className="acesso__marca">
        <span className="acesso__pauta" aria-hidden="true" />
        <Link to="/" className="marca" aria-label="RITHMO">
          <span className="marca__pulso" aria-hidden="true" />
          <span className="marca__nome">RITHMO</span>
        </Link>

        <div className="acesso__frase">
          <span>Um novo ritmo</span>
          <span>começa <em>hoje</em>.</span>
        </div>

        <div>
          <p className="acesso__demo">
            protótipo — crie uma conta local ou use as contas demo na tela de
            entrada.
          </p>
        </div>
      </aside>

      <section className="acesso__painel">
        <div className="acesso__painel-interno">
          <p className="acesso__eyebrow">Começar</p>
          <h1 className="acesso__titulo">Criar conta</h1>
          <p className="acesso__subtitulo">Escolha o seu ponto de partida.</p>

          <div className="campo">
            <legend className="campo__legenda">
              Como você usa o RITHMO?
            </legend>
            <div
              className="perfil-opcoes"
              role="radiogroup"
              aria-label="Perfil"
            >
              {PERFIS.map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  role="radio"
                  aria-checked={perfil === opcao.id}
                  className={`perfil-opcao${
                    perfil === opcao.id ? ' perfil-opcao--ativo' : ''
                  }`}
                  onClick={() => setPerfil(opcao.id)}
                >
                  <span className="perfil-opcao__marca" aria-hidden="true" />
                  <span className="perfil-opcao__texto">
                    <strong>{opcao.titulo}</strong>
                    <small>{opcao.descricao}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form className="formulario" onSubmit={aoEnviar} noValidate>
            <div className="campo campo--regua">
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

            <div className="campo campo--regua">
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

            <div className="campo campo--regua">
              <label htmlFor="campo-senha">Senha</label>
              <input
                id="campo-senha"
                type="password"
                value={senha}
                autoComplete="new-password"
                placeholder="mínimo de 6 caracteres"
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

          <p className="acesso__rodape">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
