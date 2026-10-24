import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { LinhaAtividade } from '../components/LinhaAtividade';
import { ModalAtividade } from '../components/ModalAtividade';
import { ConfirmarExclusao } from '../components/ConfirmarExclusao';
import { EstadoVazio } from '../components/EstadoVazio';
import { Esqueleto } from '../components/Esqueleto';
import { Botao } from '../components/Botao';
import { Icone } from '../components/Icone';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import {
  useProgresso,
  useRotinaHoje,
} from '../hooks/dados';
import * as rithmo from '../lib/rithmo';
import { formatarDiaExtenso, hojeISO, pluralizar } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import { ehConcluida, type Atividade } from '../types';

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
  const dados = rotina.dados;

  const [modalAberta, setModalAberta] = useState(false);
  const [editando, setEditando] = useState<Atividade | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Atividade[]>([]);

  // NOVO — modo de seleção em massa (concluir/excluir várias de uma vez).
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());

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

  const aoExcluir = async (atividades: Atividade[]) => {
    try {
      await Promise.all(atividades.map((a) => rithmo.excluirAtividade(a.id)));
      await Promise.all([rotina.recarregar(), progresso.recarregar()]);
      toast.mostrar(
        atividades.length > 1 ? 'Atividades excluídas.' : 'Atividade excluída.',
      );
      if (atividades.length > 1) aoCancelarSelecao();
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível excluir'), 'erro');
    }
    setParaExcluir([]);
  };

  // NOVO — modo de seleção em massa.
  const aoAlternarSelecao = (atividade: Atividade) => {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(atividade.id)) novo.delete(atividade.id);
      else novo.add(atividade.id);
      return novo;
    });
  };

  const aoCancelarSelecao = () => {
    setModoSelecao(false);
    setSelecionadas(new Set());
  };

  const atividadesSelecionadas = (dados?.atividades ?? []).filter((a) =>
    selecionadas.has(a.id),
  );

  const aoConcluirSelecionadas = async () => {
    const pendentes = atividadesSelecionadas.filter((a) => !ehConcluida(a));
    if (pendentes.length === 0) return;
    try {
      await Promise.all(pendentes.map((a) => rithmo.alternarConclusao(a.id)));
      await Promise.all([rotina.recarregar(), progresso.recarregar()]);
      toast.mostrar(
        pendentes.length > 1
          ? `${pendentes.length} atividades concluídas.`
          : 'Atividade concluída.',
      );
      aoCancelarSelecao();
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível concluir'), 'erro');
    }
  };

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

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
                      {modoSelecao
                        ? `${selecionadas.size} ${
                            selecionadas.size === 1 ? 'selecionada' : 'selecionadas'
                          }`
                        : `${dados.concluidas} de ${dados.total} — um dia de cada vez.`}
                    </p>
                  </div>

                  {/* NOVO — modo de seleção: concluir/excluir várias atividades de uma vez */}
                  {modoSelecao ? (
                    <div className="rotina-cabecalho__acoes">
                      <Botao variante="fantasma" onClick={aoCancelarSelecao}>
                        Cancelar
                      </Botao>
                      <Botao
                        variante="fantasma"
                        disabled={
                          atividadesSelecionadas.filter((a) => !ehConcluida(a))
                            .length === 0
                        }
                        onClick={() => void aoConcluirSelecionadas()}
                      >
                        <Icone nome="check" tamanho={14} />
                        Concluir
                      </Botao>
                      <Botao
                        variante="perigo"
                        disabled={selecionadas.size === 0}
                        onClick={() => setParaExcluir(atividadesSelecionadas)}
                      >
                        <Icone nome="trash" tamanho={14} />
                        Excluir
                      </Botao>
                    </div>
                  ) : (
                    <div className="rotina-cabecalho__acoes">
                      <Botao variante="fantasma" onClick={() => setModoSelecao(true)}>
                        Selecionar
                      </Botao>
                      <Botao onClick={() => setModalAberta(true)}>
                        <Icone nome="plus" tamanho={14} />
                        Nova atividade
                      </Botao>
                    </div>
                  )}
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
                          selecionavel={modoSelecao}
                          selecionada={selecionadas.has(atividade.id)}
                          onSelecionar={aoAlternarSelecao}
                          onAlternar={aoAlternar}
                          onEditar={(item) => setEditando(item)}
                          onExcluir={(item) => setParaExcluir([item])}
                        />
                      ))}
                    </section>
                  ))}
                </div>
              </section>
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
        atividades={paraExcluir}
        onCancelar={() => setParaExcluir([])}
        onConfirmar={aoExcluir}
      />
    </div>
  );
}