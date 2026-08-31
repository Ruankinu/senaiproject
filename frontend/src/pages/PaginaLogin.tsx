import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Botao } from '../components/Botao';
import { Marca } from '../components/Marca';
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
    <main className="acesso">
      <aside className="acesso__marca">
        <div className="acesso__logo">
          <Marca tamanho="grande" className="marca-marca--sobre-roxo" />
        </div>

        <p className="acesso__frase">
          Seu ritmo.
          <em>Um dia de cada vez.</em>
        </p>

        <p className="acesso__demo">
          pacientes: ana@rithmo.app · lucas@rithmo.app · psicóloga:
          psicologa@rithmo.app (senha 123456)
        </p>
      </aside>

      <section className="acesso__painel">
        <div className="acesso__painel-interno">
          <p className="acesso__eyebrow">Acesso</p>
          <h1 className="acesso__titulo">Entrar</h1>
          <p className="acesso__subtitulo">
            Continue o seu dia — a rotina espera.
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

          <p className="acesso__rodape">
            Ainda não tem conta? <Link to="/registro">Criar conta</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
