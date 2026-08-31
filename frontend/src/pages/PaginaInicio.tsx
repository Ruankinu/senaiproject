import { useEffect, useRef, useState } from 'react';
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
import { formatarDataLonga, hojeISO, pluralizar } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import type { Atividade, Progresso } from '../types';

/** Agrupa a rotina em períodos do dia — a vitrine do "meu dia". */
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

function saudacaoDoDia(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
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

  // celebração discreta ao desbloquear conquista
  const progressoRef = useRef<Progresso | null>(null);
  const antesRef = useRef<Set<string>>(new Set());
  const [conquistaNova, setConquistaNova] = useState<string | null>(null);

  useEffect(() => {
    progressoRef.current = progresso.dados;
  }, [progresso.dados]);

  useEffect(() => {
    if (conquistaNova) {
      const timer = window.setTimeout(() => setConquistaNova(null), 6000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [conquistaNova]);

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
    antesRef.current = new Set(
      (progressoRef.current?.badges ?? [])
        .filter((b) => b.aberta)
        .map((b) => b.id),
    );
    try {
      await rithmo.alternarConclusao(atividade.id);
      await Promise.all([rotina.recarregar(), progresso.recarregar()]);
      toast.mostrar(concluindo ? 'Atividade concluída.' : 'Atividade reaberta.');
      // dá um instante para o estado novo chegar antes de comparar
      window.setTimeout(() => {
        const depois = new Set(
          (progressoRef.current?.badges ?? [])
            .filter((b) => b.aberta)
            .map((b) => b.id),
        );
        const novo = [...depois].find((id) => !antesRef.current.has(id));
        if (novo) {
          const badge = progressoRef.current?.badges.find((b) => b.id === novo);
          if (badge) {
            setConquistaNova(badge.nome);
            toast.mostrar(`Conquista desbloqueada: ${badge.nome}`, 'conquista');
          }
        }
      }, 900);
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
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

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
            <header className="saudacao">
              <div>
                <p className="saudacao__rotulo">Hoje · {formatarDataLonga(hoje)}</p>
                <h1 className="saudacao__titulo">
                  {saudacaoDoDia()}, {primeiroNome}.
                </h1>
                <p className="saudacao__data">
                  {pluralizar(dados.total, 'atividade planejada', 'atividades planejadas')} para o seu dia
                </p>
              </div>
              <div className="saudacao__acoes">
                <Botao onClick={() => setModalAberta(true)}>
                  <Icone nome="plus" tamanho={15} />
                  Nova atividade
                </Botao>
              </div>
            </header>

            <section
              className="progresso-hero"
              aria-label={`Progresso do dia: ${dados.concluidas} de ${dados.total} atividades`}
            >
              <div>
                <p className="progresso-hero__rotulo">Seu dia</p>
                <h2 className="progresso-hero__titulo">
                  {dados.concluidas === dados.total && dados.total > 0
                    ? 'Dia completo.'
                    : 'Ainda em movimento.'}
                </h2>
                <p className="progresso-hero__texto">
                  {dados.concluidas} de {dados.total} {pluralizar(dados.total, 'atividade concluída', 'atividades concluídas')}
                </p>
                <div className="progresso-hero__barra">
                  <i style={{ width: `${dados.progresso}%` }} />
                </div>
              </div>
              <div className="progresso-hero__contagem">
                <span className="progresso-hero__fracao">
                  {dados.concluidas}/{dados.total}
                </span>
                <span className="progresso-hero__pct">
                  <Icone nome="check" tamanho={12} />
                  {dados.progresso}%
                </span>
              </div>
            </section>

            <div className="grade-dia">
              <section className="coluna-rotina" aria-label="Sua rotina de hoje">
                <header className="rotina-cabecalho">
                  <div>
                    <h2 className="rotina-cabecalho__titulo">Rotina</h2>
                    <p className="rotina-cabecalho__legenda">
                      {dados.atividades.length} {pluralizar(dados.atividades.length, 'momento', 'momentos')} — siga o seu compasso.
                    </p>
                  </div>
                </header>

                <div>
                  {periodos.map((periodo, indice) => (
                    <section className="periodo" key={periodo.nome} aria-label={periodo.nome}>
                      <h3
                        className={`periodo__rotulo${
                          indice === 0 ? ' periodo__rotulo--verde' : ''
                        }`}
                      >
                        {periodo.nome}
                      </h3>
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
                {conquistaNova && (
                  <section className="cartao apoio-card" role="status" aria-live="polite">
                    <span className="apoio-card__rotulo">Conquista desbloqueada</span>
                    <div className="conquista-chip">
                      <span className="conquista-chip__icone conquista-chip__icone--verde">
                        <Icone nome="trophy" tamanho={13} />
                      </span>
                      <span className="conquista-chip__nome">{conquistaNova}</span>
                    </div>
                  </section>
                )}
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
            <header className="saudacao">
              <div>
                <p className="saudacao__rotulo">Hoje · {formatarDataLonga(hoje)}</p>
                <h1 className="saudacao__titulo">{saudacaoDoDia()}, {primeiroNome}.</h1>
              </div>
              <div className="saudacao__acoes">
                <Botao onClick={() => setModalAberta(true)}>
                  <Icone nome="plus" tamanho={15} />
                  Nova atividade
                </Botao>
              </div>
            </header>
            <EstadoVazio
              titulo="Nada planejado para hoje."
              texto="Adicione sua primeira atividade com horário e prioridade — um dia de cada vez."
              acao={{ rotulo: 'Nova atividade', onClick: () => setModalAberta(true) }}
            />
            <div className="grade-dia">
              <aside className="coluna-apoio" style={{ position: 'static' }}>
                {progresso.dados && <SecaoConsistencia progresso={progresso.dados} />}
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
