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

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const usuario = await entrar(email.trim(), senha);
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
      <div className="auth__cartao">
        <Link to="/" className="marca marca--central" aria-label="RITHMO">
          <span className="marca__pulso" aria-hidden="true" />
          <span className="marca__nome">RITHMO</span>
        </Link>
        <p className="auth__tagline">Seu ritmo. Um dia de cada vez.</p>

        <form className="formulario" onSubmit={aoEnviar} noValidate>
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
              autoComplete="current-password"
              placeholder="••••••"
              onChange={(e) => setSenha(e.target.value)}
            />
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

        <p className="auth__demo">
          Ambiente de demonstração — paciente: <code>ana@rithmo.app</code> ·
          psicóloga: <code>psicologa@rithmo.app</code> (senha <code>123456</code>)
        </p>
      </div>
    </main>
  );
}
