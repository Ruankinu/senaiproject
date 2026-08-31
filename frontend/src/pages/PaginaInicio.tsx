import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { LinhaAtividade } from '../components/LinhaAtividade';
import { ModalAtividade } from '../components/ModalAtividade';
import { ConfirmarExclusao } from '../components/ConfirmarExclusao';
import { SecaoConsistencia } from '../components/SecaoConsistencia';
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
import { formatarDiaExtenso, hojeISO, pluralizar } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import type { Atividade } from '../types';

/** Agrupa a rotina em períodos do dia — a agenda vira um dia organizado. */
function agruparPorPeriodo(atividades: Atividade[]) {
  const periodos: { nome: string; itens: Atividade[] }[] = [
    { nome: 'Manhã', itens: [] },
    { nome: 'Tarde', itens: [] },
    { nome: 'Noite', itens: [] },
    { nome: 'Ao longo do dia', itens: [] },
  ];

  for (const atividade of atividades) {
    if (!atividade.horario) {
      periodos[3].itens.push(atividade);
      continue;
    }
    const hora = Number(atividade.horario.slice(0, 2));
    if (hora < 12) periodos[0].itens.push(atividade);
    else if (hora < 18) periodos[1].itens.push(atividade);
    else periodos[2].itens.push(atividade);
  }

  return periodos.filter((periodo) => periodo.itens.length > 0);
}

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

  const dados = rotina.dados;
  const hoje = hojeISO();
  const temAtividades = Boolean(dados && dados.total > 0);
  const periodos = temAtividades ? agruparPorPeriodo(dados!.atividades) : [];

  return (
    <div className="container">
      <Cabecalho usuario={usuario!} onSair={aoSair} />

      <main className="pagina">
        {rotina.carregando && <Esqueleto linhas={4} />}

        {!rotina.carregando && rotina.erro && (
          <section className="erro-painel" role="alert">
            <h2>Não conseguimos carregar sua rotina.</h2>
            <p>{rotina.erro}</p>
            <Botao variante="fantasma" onClick={() => void rotina.recarregar()}>
              Tentar novamente
            </Botao>
          </section>
        )}

        {!rotina.carregando && !rotina.erro && dados && temAtividades && (
          <>
            <section
              className="dia-faixa"
              aria-label={`Seu dia: ${formatarDiaExtenso(hoje)}`}
            >
              <div>
                <p className="dia-faixa__eyebrow">{formatarDiaExtenso(hoje)}</p>
                <h1 className="dia-faixa__titulo">Seu dia.</h1>
              </div>
              <div className="dia-faixa__meta">
                <span className="dia-faixa__fracao">
                  {dados.concluidas}/{dados.total}
                </span>
                <span className="dia-faixa__legenda">
                  {pluralizar(dados.total, 'atividade concluída', 'atividades concluídas')}
                </span>
                <span
                  className="dia-faixa__barra"
                  role="progressbar"
                  aria-valuenow={dados.progresso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progresso de hoje"
                >
                  <i style={{ width: `${dados.progresso}%` }} />
                </span>
              </div>
            </section>

            <div className="grade-dia">
              <section className="coluna-rotina" aria-label="Sua rotina de hoje">
                <header className="rotina-cabecalho">
                  <div>
                    <h2 className="rotina-cabecalho__titulo">Sua rotina</h2>
                    <p className="rotina-cabecalho__legenda">
                      {dados.concluidas} de {dados.total} — um dia de cada vez.
                    </p>
                  </div>
                  <Botao onClick={() => setModalAberta(true)}>
                    <Icone nome="plus" tamanho={14} />
                    Nova atividade
                  </Botao>
                </header>

                <div className="agenda">
                  {periodos.map((periodo) => (
                    <section
                      className="agenda__grupo"
                      key={periodo.nome}
                      aria-label={periodo.nome}
                    >
                      <h3 className="agenda__rotulo">{periodo.nome}</h3>
                      {periodo.itens.map((atividade) => (
                        <LinhaAtividade
                          key={atividade.id}
                          atividade={atividade}
                          onAlternar={aoAlternar}
                          onEditar={(item) => setEditando(item)}
                          onExcluir={setParaExcluir}
                        />
                      ))}
                    </section>
                  ))}
                </div>
              </section>

              <aside className="coluna-apoio">
                {progresso.dados && (
                  <SecaoConsistencia progresso={progresso.dados} />
                )}
                <SecaoVinculo
                  psicologo={vinculo.psicologo}
                  carregando={vinculo.carregando}
                  onVincular={aoVincular}
                  onSucesso={(mensagem) => toast.mostrar(mensagem)}
                  onErro={(mensagem) => toast.mostrar(mensagem, 'erro')}
                />
              </aside>
            </div>
          </>
        )}

        {!rotina.carregando && !rotina.erro && dados && !temAtividades && (
          <>
            <section className="dia-faixa">
              <div>
                <p className="dia-faixa__eyebrow">{formatarDiaExtenso(hoje)}</p>
                <h1 className="dia-faixa__titulo">Seu dia.</h1>
              </div>
              <div className="dia-faixa__meta">
                <span className="dia-faixa__fracao">0/0</span>
                <span className="dia-faixa__legenda">ainda sem atividades</span>
              </div>
            </section>
            <EstadoVazio
              titulo="Nada planejado para hoje."
              texto="Adicione sua primeira atividade com horário e prioridade — um dia de cada vez."
              acao={{ rotulo: 'Nova atividade', onClick: () => setModalAberta(true) }}
            />
          </>
        )}
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
