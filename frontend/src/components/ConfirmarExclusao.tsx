import { useState } from 'react';
import { Botao } from './Botao';
import { Dialogo, DialogoTitulo } from './Dialogo';
import type { Atividade } from '../types';

interface ConfirmarExclusaoProps {
  atividade: Atividade | null;
  onCancelar: () => void;
  onConfirmar: (atividade: Atividade) => Promise<void>;
}

/**
 * Confirmação de exclusão: deixa claro qual atividade será excluída,
 * que a ação é permanente e como cancelar.
 */
export function ConfirmarExclusao({
  atividade,
  onCancelar,
  onConfirmar,
}: ConfirmarExclusaoProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!atividade) return null;

  const aoConfirmar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(atividade);
    } catch (e) {
      console.error('[excluir] Falha ao excluir atividade:', e);
      setErro('Não foi possível excluir a atividade. Tente novamente.');
      setEnviando(false);
    }
  };

  return (
    <Dialogo
      aberto={atividade !== null}
      onFechar={onCancelar}
      rotulo="titulo-exclusao"
    >
      <DialogoTitulo id="titulo-exclusao">Excluir atividade?</DialogoTitulo>
      <p className="dialogo__texto">
        <strong>“{atividade.titulo}”</strong> será excluída permanentemente.
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
