import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { LinhaAtividade } from '../components/LinhaAtividade';
import { Icone } from '../components/Icone';
import { Barra } from '../components/Barra';
import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { EsqueletoPainel } from '../components/Esqueleto';
import { useAuth } from '../context/AuthContext';
import { usePacienteDetalhe } from '../hooks/dados';
import {
  formatarDiaCurto,
  formatarDiaExtenso,
  formatarDataLonga,
  hojeISO,
  pluralizar,
  rotuloRelativo,
  somarDiasISO,
} from '../lib/dates';
import type { Atividade, RotinaDia } from '../types';

/** Agrupa a rotina do paciente em períodos do dia. */
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

/**
 * Visão do psicólogo: acompanhamento da rotina do paciente, sem prontuário.
 * O dia em um cartão de navegação; a rotina domina; histórico no apoio.
 */
export function PaginaPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();
  const idNumerico = Number(id);
  const [dia, setDia] = useState(hojeISO());

  const { resumo, rotina } = usePacienteDetalhe(idNumerico, dia);
  const rotinaDoDia: RotinaDia | null | undefined = rotina.dados;

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const relativo = rotuloRelativo(dia);
  const periodos =
    rotinaDoDia && rotinaDoDia.total > 0
      ? agruparPorPeriodo(rotinaDoDia.atividades)
      : [];

  return (
    <div className="container">
      <Cabecalho usuario={usuario!} onSair={aoSair} />

      <main className="pagina">
        <nav className="breadcrumb" aria-label="Navegação">
          <Link to="/psicologo">
            <Icone nome="arrow-left" tamanho={14} />
            Meus pacientes
          </Link>
        </nav>

        {resumo.carregando || rotina.carregando ? (
          <EsqueletoPainel />
        ) : resumo.erro || resumo.dados === null ? (
          <section className="erro-painel" role="alert">
            <h2>Paciente não encontrado.</h2>
            <p>O vínculo pode ter sido removido ou o endereço está incorreto.</p>
            <Botao variante="fantasma" onClick={() => navigate('/psicologo')}>
              Voltar para meus pacientes
            </Botao>
          </section>
        ) : (
          <>
            <header className="saudacao">
              <div>
                <p className="saudacao__rotulo">
                  {relativo ? `${relativo} · ` : ''}
                  {formatarDataLonga(dia)}
                </p>
                <h1 className="saudacao__titulo">Rotina do paciente</h1>
                <p className="saudacao__data">
                  {(rotinaDoDia?.concluidas ?? 0)} de{' '}
                  {(rotinaDoDia?.total ?? 0)}{' '}
                  {pluralizar(
                    rotinaDoDia?.total ?? 0,
                    'atividade',
                    'atividades',
                  )}{' '}
                  concluídas
                </p>
              </div>
            </header>

            <section className="dia-card" aria-label="Navegar entre dias">
              <div className="dia-card__info">
                <p className="dia-card__rotulo">
                  {relativo ? relativo : 'Dia'}
                </p>
                <h2 className="dia-card__titulo">{formatarDiaExtenso(dia)}</h2>
              </div>
              <div className="dia-card__navegar">
                <button
                  type="button"
                  className="btn btn--icone"
                  aria-label="Dia anterior"
                  onClick={() => setDia(somarDiasISO(dia, -1))}
                >
                  <Icone nome="arrow-left" tamanho={14} />
                </button>
                <span className="dia-card__alvo">{formatarDiaCurto(dia)}</span>
                <button
                  type="button"
                  className="btn btn--icone"
                  aria-label="Próximo dia"
                  onClick={() => setDia(somarDiasISO(dia, 1))}
                >
                  <Icone nome="chevron-right" tamanho={14} />
                </button>
                {dia !== hojeISO() && (
                  <Botao variante="fantasma" onClick={() => setDia(hojeISO())}>
                    Hoje
                  </Botao>
                )}
              </div>
            </section>

            <div className="resumo-linha" aria-label="Resumo da rotina">
              <span className="resumo-linha__item">
                <b>
                  {resumo.dados.hoje.concluidas}/{resumo.dados.hoje.total}
                </b>
                hoje
              </span>
              <span className="resumo-linha__item">
                <b>{resumo.dados.atrasadas}</b>
                atrasadas
              </span>
              <span className="resumo-linha__item">
                <b>{resumo.dados.progresso.streak}</b>
                dias de ritmo
              </span>
              <span className="resumo-linha__item">
                <b>
                  {resumo.dados.progresso.badges.filter((b) => b.aberta).length}
                </b>
                conquistas
              </span>
            </div>

            {rotinaDoDia && rotinaDoDia.total === 0 && (
              <EstadoVazio
                titulo="Nada planejado para este dia."
                texto="O paciente ainda não adicionou atividades para esta data."
              />
            )}

            {rotinaDoDia && rotinaDoDia.total > 0 && (
              <div className="grade-dia">
                <section
                  className="coluna-rotina"
                  aria-label={`Atividades de ${formatarDiaExtenso(dia)}`}
                >
                  <header className="rotina-cabecalho">
                    <div>
                      <h2 className="rotina-cabecalho__titulo">Rotina</h2>
                      <p className="rotina-cabecalho__legenda">
                        {formatarDiaCurto(dia)} — dados reais da rotina.
                      </p>
                    </div>
                  </header>

                  <div>
                    {periodos.map((periodo, indice) => (
                      <section
                        className="periodo"
                        key={periodo.nome}
                        aria-label={periodo.nome}
                      >
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
                            somenteLeitura
                          />
                        ))}
                      </section>
                    ))}
                  </div>
                </section>

                <aside className="coluna-apoio">
                  <section className="cartao apoio-card" aria-label="Ritmo do paciente">
                    <span className="apoio-card__rotulo">Ritmo</span>
                    <div className="consistencia">
                      <span className="consistencia__numero">
                        {resumo.dados.progresso.streak}
                      </span>
                      <span className="consistencia__texto">
                        {pluralizar(
                          resumo.dados.progresso.streak,
                          'dia',
                          'dias',
                        )}{' '}
                        de ritmo
                      </span>
                    </div>
                  </section>

                  <section className="cartao apoio-card" aria-label="Últimos 7 dias">
                    <span className="apoio-card__rotulo">Últimos 7 dias</span>
                    <div className="historico">
                      {resumo.dados.ultimos7
                        .slice()
                        .reverse()
                        .map((diaResumo) => {
                          const percentual =
                            diaResumo.total === 0
                              ? 0
                              : Math.round(
                                  (diaResumo.concluidas / diaResumo.total) * 100,
                                );
                          return (
                            <div
                              key={diaResumo.data}
                              className="historico__dia"
                            >
                              <span className="historico__rotulo">
                                {formatarDiaCurto(diaResumo.data)}
                              </span>
                              <Barra
                                valor={percentual}
                                rotulo={`${diaResumo.concluidas} de ${diaResumo.total} atividades concluídas`}
                                className="historico__trilho"
                              />
                              <span className="historico__valor">
                                {diaResumo.concluidas}/{diaResumo.total}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                </aside>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
