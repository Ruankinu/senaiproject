import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { LinhaAtividade } from '../components/LinhaAtividade';
import { Icone } from '../components/Icone';
import { Barra } from '../components/Barra';
import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { useAuth } from '../context/AuthContext';
import { usePacienteDetalhe } from '../hooks/dados';
import {
  formatarDiaCurto,
  formatarDiaExtenso,
  hojeISO,
  pluralizar,
  rotuloRelativo,
  somarDiasISO,
} from '../lib/dates';

/**
 * Visão do psicólogo sobre a rotina do paciente: acompanhamento,
 * sem diagnóstico e sem prontuário. Permite navegar entre dias reais.
 */
export function PaginaPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();
  const idNumerico = Number(id);
  const [dia, setDia] = useState(hojeISO());

  const { resumo, rotina } = usePacienteDetalhe(idNumerico, dia);
  const rotinaDoDia = rotina.dados;

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const nomePaciente = resumo.dados ? 'Rotina do paciente' : 'Paciente';
  const relativo = rotuloRelativo(dia);

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
            <header className="pagina__cabecalho">
              <div>
                <p className="rotulo-data">Rotina de hoje</p>
                <h1 className="titulo-pagina">{nomePaciente}</h1>
                <p className="subtitulo">
                  {formatarDiaCurto(dia)}
                  {' · '}
                  {(rotinaDoDia?.concluidas ?? 0)} de{' '}
                  {(rotinaDoDia?.total ?? 0)}{' '}
                  {pluralizar(rotinaDoDia?.total ?? 0, 'atividade', 'atividades')}{' '}
                  concluídas
                </p>
              </div>
            </header>

            <nav className="pagina__nav-dia" aria-label="Navegar entre dias">
              <button
                type="button"
                className="btn btn--icone"
                aria-label="Dia anterior"
                onClick={() => setDia(somarDiasISO(dia, -1))}
              >
                <Icone nome="arrow-left" tamanho={14} />
              </button>
              <span className="nav-dia__alvo">
                {relativo ? `${relativo} · ` : ''}
                {formatarDiaExtenso(dia)}
              </span>
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
            </nav>

            <div className="resumo-linha" aria-label="Resumo da rotina">
              <span className="resumo-linha__item">
                <b>
                  {resumo.dados.hoje.concluidas}/{resumo.dados.hoje.total}
                </b>
                atividades hoje
              </span>
              <span className="resumo-linha__item">
                <b>{resumo.dados.atrasadas}</b>
                atrasadas em aberto
              </span>
              <span className="resumo-linha__item">
                <b>{resumo.dados.progresso.streak}</b>
                dias de consistência
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
              <section
                className="rotina"
                aria-label={`Atividades de ${formatarDiaExtenso(dia)}`}
              >
                {rotinaDoDia.atividades.map((atividade) => (
                  <LinhaAtividade
                    key={atividade.id}
                    atividade={atividade}
                    somenteLeitura
                  />
                ))}
              </section>
            )}

            <section className="secao" aria-label="Últimos 7 dias">
              <header className="secao__cabecalho">
                <div>
                  <h2 className="secao__titulo">Últimos 7 dias</h2>
                  <p className="secao__legenda">
                    Execução diária — dados reais da rotina.
                  </p>
                </div>
              </header>

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
                      <div key={diaResumo.data} className="historico__dia">
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
          </>
        )}
      </main>
    </div>
  );
}

function EsqueletoPainel() {
  return (
    <div className="esqueleto-painel esqueleto-painel--alto" aria-hidden="true">
      <span className="esqueleto__linha esqueleto__linha--titulo" />
      <span className="esqueleto__linha" />
      <span className="esqueleto__linha" />
      <span className="esqueleto__linha" />
    </div>
  );
}
