import { useState } from 'react';
import { Dialogo, DialogoTitulo } from './Dialogo';
import { FormularioTarefa } from './FormularioTarefa';
import { mensagemErro } from '../lib/errors';
import type { TarefaPayload } from '../types/task';

interface ModalNovaTarefaProps {
  aberto: boolean;
  onFechar: () => void;
  onSubmit: (dados: TarefaPayload) => Promise<unknown>;
  onErro: (mensagem: string) => void;
  onSucesso: (mensagem: string) => void;
}

/**
 * Cadastro rápido: quatro campos, sempre visíveis, foco imediato no título.
 */
export function ModalNovaTarefa({
  aberto,
  onFechar,
  onSubmit,
  onErro,
  onSucesso,
}: ModalNovaTarefaProps) {
  const [enviando, setEnviando] = useState(false);

  const aoEnviar = async (dados: TarefaPayload) => {
    setEnviando(true);
    try {
      await onSubmit(dados);
      onFechar();
      onSucesso('Tarefa criada com sucesso.');
    } catch (e) {
      onErro(mensagemErro(e, 'Não foi possível criar a tarefa'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={aberto} onFechar={onFechar} rotulo="titulo-nova-tarefa">
      <DialogoTitulo id="titulo-nova-tarefa">Nova tarefa</DialogoTitulo>
      <FormularioTarefa
        rotuloEnvio="Adicionar tarefa"
        enviando={enviando}
        onEnviar={aoEnviar}
        onCancelar={onFechar}
      />
    </Dialogo>
  );
}
