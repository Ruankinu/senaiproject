import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Botao } from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import { mensagemErro } from '../lib/errors';

export function PaginaLogin() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();

    const novos: { email?: string; senha?: string } = {};
    if (!email.trim()) novos.email = 'Informe seu e-mail.';
    if (!senha) novos.senha = 'Informe sua senha.';
    if (Object.keys(novos).length > 0) {
      setErros(novos);
      setErro(null);
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const usuario = await entrar(email.trim(), senha);
      if (!usuario) {
        // Protótipo: verificação local — sem request, sem 401.
        setErro('E-mail ou senha incorretos.');
        return;
      }
      navigate(usuario.perfil === 'psicologo' ? '/psicologo' : '/', {
        replace: true,
      });
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível entrar'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth">
      <aside className="auth__marca">
        <Link to="/" className="marca" aria-label="RITHMO">
          <span className="marca__pulso" aria-hidden="true" />
          <span className="marca__nome">RITHMO</span>
        </Link>

        <div className="auth__frase">
          <span>Seu ritmo.</span>
          <span>Um dia de <em>cada vez</em>.</span>
        </div>

        <div>
          <p className="auth__nota">
            Rotina, consistência e acompanhamento — entre você e seu
            psicólogo, no mesmo lugar.
          </p>
          <p className="auth__demo">
            Ambiente de demonstração: pacientes <code>ana@rithmo.app</code> e{' '}
            <code>lucas@rithmo.app</code> · psicóloga{' '}
            <code>psicologa@rithmo.app</code> (senha <code>123456</code>)
          </p>
        </div>
      </aside>

      <section className="auth__painel">
        <div className="auth__painel-interno">
          <h1 className="auth__titulo">Entrar</h1>
          <p className="auth__subtitulo">
            Continue de onde parou — sua rotina espera.
          </p>

          <form className="formulario" onSubmit={aoEnviar} noValidate>
            <div className="campo campo--regua">
              <label htmlFor="campo-email">E-mail</label>
              <input
                id="campo-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="voce@exemplo.com"
                aria-invalid={Boolean(erros.email)}
                onChange={(e) => setEmail(e.target.value)}
              />
              {erros.email && <p className="campo-erro">{erros.email}</p>}
            </div>

            <div className="campo campo--regua">
              <label htmlFor="campo-senha">Senha</label>
              <input
                id="campo-senha"
                type="password"
                value={senha}
                autoComplete="current-password"
                placeholder="sua senha"
                aria-invalid={Boolean(erros.senha)}
                onChange={(e) => setSenha(e.target.value)}
              />
              {erros.senha && <p className="campo-erro">{erros.senha}</p>}
            </div>

            {erro && (
              <p className="formulario__erro" role="alert">
                {erro}
              </p>
            )}

            <Botao type="submit" carregando={enviando} className="botao-largo">
              Entrar
            </Botao>
          </form>

          <p className="auth__rodape">
            Ainda não tem conta? <Link to="/registro">Criar conta</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
