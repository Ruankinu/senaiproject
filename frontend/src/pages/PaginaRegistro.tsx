import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Botao } from '../components/Botao';
import { Marca } from '../components/Marca';
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
        <div className="acesso__logo">
          <Marca tamanho="grande" className="marca-marca--sobre-roxo" />
        </div>

        <p className="acesso__frase">
          Um novo ritmo.
          <em>Começa hoje.</em>
        </p>

        <p className="acesso__demo">
          protótipo — crie uma conta local ou use as contas demo na tela de
          entrada.
        </p>
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
            <div className="perfil-opcoes" role="radiogroup" aria-label="Perfil">
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
                  <span className="perfil-opcao__marca" aria-hidden="true">
                    {perfil === opcao.id && (
                      <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                    )}
                  </span>
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
