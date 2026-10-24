import { useEffect, useState, type FormEvent } from 'react';
import { Dialogo, DialogoTitulo } from './Dialogo';
import { Botao } from './Botao';
import { mensagemErro } from '../lib/errors';
import { atualizarPerfil } from '../lib/rithmo';
import { useAuth } from '../context/AuthContext';
import type { Usuario } from '../types';

interface ModalEditarPerfilProps {
  aberto: boolean;
  usuario: Usuario;
  onFechar: () => void;
  onSucesso: () => void;
}

/**
 * NOVO — Editar nome e e-mail da própria conta. Modal simples, no mesmo
 * padrão do ModalAtividade (Dialogo + formulário + finally pra nunca
 * travar o botão de salvar).
 */
export function ModalEditarPerfil({
  aberto,
  usuario,
  onFechar,
  onSucesso,
}: ModalEditarPerfilProps) {
  const { atualizarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Sempre que o modal abre, começa com os dados atuais (mesmo que uma
  // edição anterior tenha sido cancelada no meio do caminho).
  useEffect(() => {
    if (!aberto) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
    setErro(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const aoFechar = () => {
    if (enviando) return;
    onFechar();
  };

  const aoSalvar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setErro('Preencha nome e e-mail.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const resposta = await atualizarPerfil({
        nome: nome.trim(),
        email: email.trim(),
      });
      atualizarUsuario(resposta.usuario);
      onSucesso();
      onFechar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={aberto} onFechar={aoFechar} rotulo="titulo-editar-perfil">
      <DialogoTitulo id="titulo-editar-perfil">Editar dados</DialogoTitulo>

      <form className="formulario" onSubmit={(e) => void aoSalvar(e)} noValidate>
        <div className="campo campo--regua">
          <label htmlFor="perfil-edicao-nome">Nome</label>
          <input
            id="perfil-edicao-nome"
            type="text"
            value={nome}
            autoComplete="name"
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="campo campo--regua">
          <label htmlFor="perfil-edicao-email">E-mail</label>
          <input
            id="perfil-edicao-email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {erro && (
          <p className="formulario__erro" role="alert">
            {erro}
          </p>
        )}

        <div className="dialogo__acoes">
          <Botao type="button" variante="fantasma" onClick={aoFechar} disabled={enviando}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={enviando}>
            Salvar
          </Botao>
        </div>
      </form>
    </Dialogo>
  );
}