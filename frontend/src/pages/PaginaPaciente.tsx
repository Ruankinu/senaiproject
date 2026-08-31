import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { LinhaAtividade } from '../components/LinhaAtividade';
import { BarraProgresso } from '../components/BarraProgresso';
import { Icone } from '../components/Icone';
import { EstadoVazio } from '../components/EstadoVazio';
import { Botao } from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import { usePacienteDetalhe } from '../hooks/dados';
import { formatarDiaCurto, hojeISO, pluralizar } from '../lib/dates';

/**
 * Visão do psicólogo sobre a rotina do paciente: acompanhamento,
 * sem diagnóstico e sem prontuário.
 */
export function PaginaPaciente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();
  const idNumerico = Number(id);

  const { resumo, rotina } = usePacienteDetalhe(idNumerico);

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const nomePaciente = resumo.dados ? 'Rotina do paciente' : 'Paciente';

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
            <header className="pagina__linha">
              <div>
                <h1 className="titulo-pagina">{nomePaciente}</h1>
                <p className="resumo">
                  {formatarDiaCurto(rotina.dados?.data ?? hojeISO())}
                  {' · '}
                  {rotina.dados?.concluidas ?? 0} de {rotina.dados?.total ?? 0}{' '}
                  {pluralizar(rotina.dados?.total ?? 0, 'atividade', 'atividades')}{' '}
                  hoje
                </p>
              </div>
            </header>

            <div className="resumo-paciente">
              <div className="resumo-paciente__item">
                <span className="resumo-paciente__valor">
                  {resumo.dados.hoje.concluidas}/{resumo.dados.hoje.total}
                </span>
                <span className="resumo-paciente__rotulo">hoje</span>
              </div>
              <div className="resumo-paciente__item">
                <span className="resumo-paciente__valor">
                  {resumo.dados.atrasadas}
                </span>
                <span className="resumo-paciente__rotulo">atrasadas</span>
              </div>
              <div className="resumo-paciente__item">
                <span className="resumo-paciente__valor">
                  {resumo.dados.progresso.streak}
                </span>
                <span className="resumo-paciente__rotulo">dias seguidos</span>
              </div>
              <div className="resumo-paciente__item">
                <span className="resumo-paciente__valor">
                  {
                    resumo.dados.progresso.badges.filter((b) => b.aberta)
                      .length
                  }
                </span>
                <span className="resumo-paciente__rotulo">conquistas</span>
              </div>
            </div>

            <h2 className="secao__titulo secao__titulo--acima">
              Rotina de hoje
            </h2>

            {rotina.dados && rotina.dados.total === 0 && (
              <EstadoVazio
                titulo="Nada planejado para hoje."
                texto="O paciente ainda não adicionou atividades para esta data."
              />
            )}

            {rotina.dados && rotina.dados.total > 0 && (
              <>
                <div className="pagina__progresso">
                  <BarraProgresso
                    valor={rotina.dados.progresso}
                    rotulo={`Progresso do dia: ${rotina.dados.progresso}%`}
                  />
                </div>
                <section className="atividades" aria-label="Atividades do paciente">
                  {rotina.dados.atividades.map((atividade) => (
                    <LinhaAtividade
                      key={atividade.id}
                      atividade={atividade}
                      somenteLeitura
                    />
                  ))}
                </section>
              </>
            )}

            <h2 className="secao__titulo secao__titulo--acima">
              Últimos 7 dias
            </h2>

            <div className="historico">
              {resumo.dados.ultimos7
                .slice()
                .reverse()
                .map((dia) => {
                  const percentual =
                    dia.total === 0
                      ? 0
                      : Math.round((dia.concluidas / dia.total) * 100);
                  return (
                    <div key={dia.data} className="historico__dia">
                      <span className="historico__rotulo">
                        {formatarDiaCurto(dia.data)}
                      </span>
                      <span className="historico__barra">
                        <BarraProgresso
                          valor={percentual}
                          rotulo={`${dia.concluidas} de ${dia.total} concluídas`}
                        />
                      </span>
                      <span className="historico__valor">
                        {dia.concluidas}/{dia.total}
                      </span>
                    </div>
                  );
                })}
            </div>
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
