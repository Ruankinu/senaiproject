import { useEffect, useState, type FormEvent } from 'react';
import { Dialogo, DialogoTitulo } from './Dialogo';
import { Botao } from './Botao';
import { mensagemErro } from '../lib/errors';
import { alterarSenha } from '../lib/rithmo';

interface ModalAlterarSenhaProps {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

/**
 * NOVO — Trocar a senha da própria conta. Pede a senha atual (o back
 * confere antes de aceitar) e a nova senha duas vezes, pra evitar erro
 * de digitação. Mesmo padrão dos outros modais (Dialogo + finally).
 */
export function ModalAlterarSenha({
  aberto,
  onFechar,
  onSucesso,
}: ModalAlterarSenhaProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Sempre que o modal abre, começa limpo.
  useEffect(() => {
    if (!aberto) return;
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
    setErro(null);
  }, [aberto]);

  const aoFechar = () => {
    if (enviando) return;
    onFechar();
  };

  const aoSalvar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!senhaAtual || !novaSenha || !confirmacao) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (novaSenha.length < 6) {
      setErro('A nova senha precisa ter ao menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('A confirmação não bate com a nova senha.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await alterarSenha({ senhaAtual, novaSenha });
      onSucesso();
      onFechar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível trocar a senha'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={aberto} onFechar={aoFechar} rotulo="titulo-alterar-senha">
      <DialogoTitulo id="titulo-alterar-senha">Alterar senha</DialogoTitulo>

      <form className="formulario" onSubmit={(e) => void aoSalvar(e)} noValidate>
        <div className="campo campo--regua">
          <label htmlFor="senha-atual">Senha atual</label>
          <input
            id="senha-atual"
            type="password"
            value={senhaAtual}
            autoComplete="current-password"
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </div>

        <div className="campo campo--regua">
          <label htmlFor="nova-senha">Nova senha</label>
          <input
            id="nova-senha"
            type="password"
            value={novaSenha}
            autoComplete="new-password"
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>

        <div className="campo campo--regua">
          <label htmlFor="confirmar-senha">Confirmar nova senha</label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirmacao}
            autoComplete="new-password"
            onChange={(e) => setConfirmacao(e.target.value)}
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