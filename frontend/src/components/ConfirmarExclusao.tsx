import { useState } from 'react';
import { Botao } from './Botao';
import { Dialogo, DialogoTitulo } from './Dialogo';
import type { Atividade } from '../types';

interface ConfirmarExclusaoProps {
  // NOVO — antes era uma atividade só (ou null); agora é uma lista, pra
  // servir tanto a exclusão individual ([atividade]) quanto a em massa
  // (várias de uma vez). Lista vazia = diálogo fechado.
  atividades: Atividade[];
  onCancelar: () => void;
  onConfirmar: (atividades: Atividade[]) => Promise<void>;
}

/**
 * Confirmação de exclusão: deixa claro o que será excluído (uma
 * atividade, pelo nome, ou a quantidade em massa), que é permanente e
 * como cancelar.
 */
export function ConfirmarExclusao({
  atividades,
  onCancelar,
  onConfirmar,
}: ConfirmarExclusaoProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (atividades.length === 0) return null;
  const emMassa = atividades.length > 1;

  const aoConfirmar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await onConfirmar(atividades);
    } catch (e) {
      console.error('[excluir] Falha ao excluir atividade(s):', e);
      setErro('Não foi possível excluir. Tente novamente.');
    } finally {
      // CORRIGIDO — mesmo bug do ModalAtividade: só desligava em caso de
      // erro. Como esse componente continua montado (só renderiza null
      // enquanto não há nada pra excluir), "enviando" ficava travado em
      // true pra próxima exclusão, que já abria com o botão bloqueado.
      setEnviando(false);
    }
  };

  return (
    <Dialogo
      aberto={atividades.length > 0}
      onFechar={onCancelar}
      rotulo="titulo-exclusao"
    >
      <DialogoTitulo id="titulo-exclusao">
        {emMassa ? `Excluir ${atividades.length} atividades?` : 'Excluir atividade?'}
      </DialogoTitulo>
      <p className="dialogo__texto">
        {emMassa ? (
          <>
            As <strong>{atividades.length} atividades selecionadas</strong>{' '}
            serão excluídas permanentemente. Essa ação não pode ser desfeita.
          </>
        ) : (
          <>
            <strong>“{atividades[0].titulo}”</strong> será excluída
            permanentemente. Essa ação não pode ser desfeita.
          </>
        )}
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