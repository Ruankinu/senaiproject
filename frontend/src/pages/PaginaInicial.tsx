import { useState } from 'react';
import { Cabecalho } from '../components/Cabecalho';
import { ModalNovaTarefa } from '../components/ModalNovaTarefa';
import { ConfirmarExclusao } from '../components/ConfirmarExclusao';
import { LinhaTarefa } from '../components/LinhaTarefa';
import { EsqueletoLista } from '../components/EsqueletoLista';
import { EstadoVazio } from '../components/EstadoVazio';
import { Resumo } from '../components/Resumo';
import { Botao } from '../components/Botao';
import { useToast } from '../components/Toast';
import { useTarefas } from '../hooks/useTarefas';
import type { Tarefa } from '../types/task';

export function PaginaInicial() {
  const toast = useToast();
  const { tarefas, carregando, erro, recarregar, criar, alternarConclusao, excluir } =
    useTarefas();

  const [modalAberta, setModalAberta] = useState(false);
  const [tarefaExcluir, setTarefaExcluir] = useState<Tarefa | null>(null);

  const aoAlternar = async (tarefa: Tarefa) => {
    const concluidaAntes = tarefa.status?.trim().toLowerCase() === 'concluída';
    try {
      await alternarConclusao(tarefa);
      toast.mostrar(concluidaAntes ? 'Tarefa reaberta.' : 'Tarefa concluída.');
    } catch (e) {
      toast.mostrar('Não foi possível concluir a operação. Tente novamente.', 'erro');
      console.error('[tarefas] Falha ao alternar conclusão:', e);
    }
  };

  const aoConfirmarExclusao = async (tarefa: Tarefa) => {
    try {
      await excluir(tarefa);
      toast.mostrar('Tarefa excluída.');
    } catch (e) {
      toast.mostrar('Não foi possível excluir a tarefa. Tente novamente.', 'erro');
      console.error('[tarefas] Falha ao excluir:', e);
    }
    setTarefaExcluir(null);
  };

  return (
    <div className="container">
      <Cabecalho onNovaTarefa={() => setModalAberta(true)} />

      <main className="pagina">
        <h1 className="titulo-pagina">Tarefas</h1>
        {!carregando && !erro && <Resumo tarefas={tarefas} />}

        {carregando && <EsqueletoLista />}

        {!carregando && erro && (
          <section className="erro-painel" role="alert">
            <h2>Não conseguimos carregar suas tarefas.</h2>
            <p>{erro}</p>
            <Botao variante="fantasma" onClick={() => void recarregar()}>
              Tentar novamente
            </Botao>
          </section>
        )}

        {!carregando && !erro && tarefas.length === 0 && (
          <EstadoVazio onCriar={() => setModalAberta(true)} />
        )}

        {!carregando && !erro && tarefas.length > 0 && (
          <section className="tarefas" aria-label="Lista de tarefas">
            <div className="tarefas__cabecalho" aria-hidden="true">
              <span />
              <span>Tarefa</span>
              <span>Prazo</span>
              <span>Prioridade</span>
              <span />
            </div>
            {tarefas.map((tarefa) => (
              <LinhaTarefa
                key={String(tarefa.id)}
                tarefa={tarefa}
                onAlternar={aoAlternar}
                onExcluir={setTarefaExcluir}
              />
            ))}
          </section>
        )}
      </main>

      <ModalNovaTarefa
        aberto={modalAberta}
        onFechar={() => setModalAberta(false)}
        onSubmit={criar}
        onSucesso={(mensagem) => toast.mostrar(mensagem)}
        onErro={(mensagem) => toast.mostrar(mensagem, 'erro')}
      />

      <ConfirmarExclusao
        tarefa={tarefaExcluir}
        onCancelar={() => setTarefaExcluir(null)}
        onConfirmar={aoConfirmarExclusao}
      />
    </div>
  );
}
