import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { LinhaAtividade } from '../components/LinhaAtividade';
import { ModalAtividade } from '../components/ModalAtividade';
import { ConfirmarExclusao } from '../components/ConfirmarExclusao';
import { BarraProgresso } from '../components/BarraProgresso';
import { SecaoStreak } from '../components/SecaoStreak';
import { SecaoVinculo } from '../components/SecaoVinculo';
import { EstadoVazio } from '../components/EstadoVazio';
import { Esqueleto } from '../components/Esqueleto';
import { Botao } from '../components/Botao';
import { Icone } from '../components/Icone';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  useProgresso,
  useRotinaHoje,
  useVinculoPaciente,
} from '../hooks/dados';
import * as rithmo from '../lib/rithmo';
import { formatarDataLonga, hojeISO, pluralizar } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import type { Atividade } from '../types';

export function PaginaInicio() {
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, sair } = useAuth();

  const rotina = useRotinaHoje();
  const progresso = useProgresso();
  const vinculo = useVinculoPaciente();

  const [modalAberta, setModalAberta] = useState(false);
  const [editando, setEditando] = useState<Atividade | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Atividade | null>(null);

  const aoSalvar = async (dados: rithmo.DadosAtividade, id?: number) => {
    if (id) {
      await rithmo.atualizarAtividade(id, dados);
      toast.mostrar('Alterações salvas.');
    } else {
      await rithmo.criarAtividade(dados);
      toast.mostrar('Atividade adicionada.');
    }
    await Promise.all([rotina.recarregar(), progresso.recarregar()]);
  };

  const aoAlternar = async (atividade: Atividade) => {
    const concluindo = atividade.status !== 'Concluída';
    try {
      await rithmo.alternarConclusao(atividade.id);
      await Promise.all([rotina.recarregar(), progresso.recarregar()]);
      toast.mostrar(concluindo ? 'Atividade concluída.' : 'Atividade reaberta.');
    } catch (e) {
      toast.mostrar('Não foi possível concluir a operação.', 'erro');
      console.error('[atividade] Falha ao alternar:', e);
    }
  };

  const aoExcluir = async (atividade: Atividade) => {
    try {
      await rithmo.excluirAtividade(atividade.id);
      await Promise.all([rotina.recarregar(), progresso.recarregar()]);
      toast.mostrar('Atividade excluída.');
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível excluir'), 'erro');
    }
    setParaExcluir(null);
  };

  const aoVincular = async (codigo: string) => {
    await vinculo.vincular(codigo);
  };

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container">
      <Cabecalho
        usuario={usuario!}
        streak={progresso.dados?.streak ?? 0}
        onSair={aoSair}
      />

      <main className="pagina">
        <div className="pagina__linha">
          <div>
            <h1 className="titulo-pagina">Hoje</h1>
            <p className="resumo">
              {formatarDataLonga(hojeISO())}
              {rotina.dados && rotina.dados.total > 0 && (
                <>
                  {' · '}
                  {rotina.dados.concluidas} de {rotina.dados.total}{' '}
                  {pluralizar(rotina.dados.total, 'atividade', 'atividades')}{' '}
                  concluídas
                </>
              )}
            </p>
          </div>
          <Botao onClick={() => setModalAberta(true)}>
            <Icone nome="plus" tamanho={14} />
            Nova atividade
          </Botao>
        </div>

        {rotina.dados && rotina.dados.total > 0 && (
          <div className="pagina__progresso">
            <BarraProgresso
              valor={rotina.dados.progresso}
              rotulo={`Progresso de hoje: ${rotina.dados.progresso}%`}
            />
          </div>
        )}

        {rotina.carregando && <Esqueleto />}

        {!rotina.carregando && rotina.erro && (
          <section className="erro-painel" role="alert">
            <h2>Não conseguimos carregar sua rotina.</h2>
            <p>{rotina.erro}</p>
            <Botao variante="fantasma" onClick={() => void rotina.recarregar()}>
              Tentar novamente
            </Botao>
          </section>
        )}

        {!rotina.carregando &&
          !rotina.erro &&
          rotina.dados &&
          rotina.dados.total === 0 && (
            <EstadoVazio
              titulo="Nada planejado para hoje."
              texto="Adicione sua primeira atividade com horário e prioridade — um dia de cada vez."
              acao={{ rotulo: 'Nova atividade', onClick: () => setModalAberta(true) }}
            />
          )}

        {!rotina.carregando &&
          !rotina.erro &&
          rotina.dados &&
          rotina.dados.total > 0 && (
            <section className="atividades" aria-label="Atividades de hoje">
              {rotina.dados.atividades.map((atividade) => (
                <LinhaAtividade
                  key={atividade.id}
                  atividade={atividade}
                  onAlternar={aoAlternar}
                  onEditar={(item) => setEditando(item)}
                  onExcluir={setParaExcluir}
                />
              ))}
            </section>
          )}

        {progresso.dados && (
          <SecaoStreak progresso={progresso.dados} />
        )}

        <SecaoVinculo
          psicologo={vinculo.psicologo}
          carregando={vinculo.carregando}
          onVincular={aoVincular}
          onSucesso={(mensagem) => toast.mostrar(mensagem)}
          onErro={(mensagem) => toast.mostrar(mensagem, 'erro')}
        />
      </main>

      <ModalAtividade
        aberto={modalAberta || Boolean(editando)}
        atividade={editando}
        onFechar={() => {
          setModalAberta(false);
          setEditando(null);
        }}
        onSubmit={aoSalvar}
      />

      <ConfirmarExclusao
        atividade={paraExcluir}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={aoExcluir}
      />
    </div>
  );
}
