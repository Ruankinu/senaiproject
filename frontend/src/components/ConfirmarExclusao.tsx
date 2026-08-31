import { useState } from 'react';
import { Botao } from './Botao';
import { Dialogo, DialogoTitulo } from './Dialogo';
import type { Tarefa } from '../types/task';

interface ConfirmarExclusaoProps {
  tarefa: Tarefa | null;
  onCancelar: () => void;
  onConfirmar: (tarefa: Tarefa) => Promise<void>;
}

/**
 * Confirmação de exclusão: deixa claro qual tarefa será excluída,
 * que a ação é permanente e como cancelar.
 */
export function ConfirmarExclusao({
  tarefa,
  onCancelar,
  onConfirmar,
}: ConfirmarExclusaoProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!tarefa) return null;

  const aoConfirmar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(tarefa);
    } catch (e) {
      console.error('[excluir] Falha ao excluir tarefa:', e);
      setErro('Não foi possível excluir a tarefa. Tente novamente.');
      setEnviando(false);
    }
  };

  return (
    <Dialogo
      aberto={tarefa !== null}
      onFechar={onCancelar}
      rotulo="titulo-exclusao"
    >
      <DialogoTitulo id="titulo-exclusao">Excluir tarefa?</DialogoTitulo>
      <p className="dialogo__texto">
        <strong>“{tarefa.titulo}”</strong> será excluída permanentemente.
        Essa ação não pode ser desfeita.
      </p>
      {erro && <p className="campo-erro">{erro}</p>}
      <div className="dialogo__acoes">
        <Botao variante="fantasma" onClick={onCancelar}>
          Cancelar
        </Botao>
        <Botao variante="perigo" carregando={enviando} onClick={aoConfirmar}>
          Excluir
        </Botao>
      </div>
    </Dialogo>
  );
}
