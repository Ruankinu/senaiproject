import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { Botao } from '../components/Botao';
import { Barra } from '../components/Barra';
import { Icone } from '../components/Icone';
import { EstadoVazio } from '../components/EstadoVazio';
import { Esqueleto } from '../components/Esqueleto';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { usePacientes } from '../hooks/dados';
import { pluralizar } from '../lib/dates';
import type { PacienteResumo } from '../types';

export function PaginaPsicologo() {
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, sair } = useAuth();
  const pacientes = usePacientes();
  const [copiado, setCopiado] = useState(false);

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const aoCopiar = async () => {
    const codigo = usuario?.codigo ?? '';
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast.mostrar('Código copiado.');
      window.setTimeout(() => setCopiado(false), 1600);
    } catch {
      toast.mostrar('Não foi possível copiar o código.', 'erro');
    }
  };

  const lista = pacientes.dados ?? [];

  return (
    <div className="container">
      <Cabecalho usuario={usuario!} onSair={aoSair} />

      <main className="pagina">
        <header className="pagina__cabecalho">
          <div>
            <p className="rotulo-data">Acompanhamento</p>
            <h1 className="titulo-pagina">Meus pacientes</h1>
            <p className="subtitulo">
              {lista.length}{' '}
              {pluralizar(lista.length, 'paciente vinculado', 'pacientes vinculados')}
            </p>
          </div>
        </header>

        <section className="secao codigo-secao" aria-label="Código de vínculo">
          <div className="codigo">
            <div className="codigo__info">
              <span className="vinculo__rotulo">Código de vínculo</span>
              <p className="codigo__valor">{usuario?.codigo ?? '—'}</p>
              <p className="codigo__descricao">
                Compartilhe com seus pacientes — eles entram com este código.
              </p>
            </div>
            <Botao variante="fantasma" onClick={() => void aoCopiar()}>
              <Icone nome="copy" tamanho={14} />
              {copiado ? 'Copiado' : 'Copiar código'}
            </Botao>
          </div>
        </section>

        {pacientes.carregando && <Esqueleto linhas={3} />}

        {!pacientes.carregando && pacientes.erro && (
          <section className="erro-painel" role="alert">
            <h2>Não conseguimos carregar seus pacientes.</h2>
            <p>{pacientes.erro}</p>
            <Botao variante="fantasma" onClick={() => void pacientes.recarregar()}>
              Tentar novamente
            </Botao>
          </section>
        )}

        {!pacientes.carregando && !pacientes.erro && lista.length === 0 && (
          <EstadoVazio
            titulo="Nenhum paciente vinculado."
            texto="Compartilhe seu código acima. Quando um paciente informá-lo, a rotina dele aparecerá aqui."
          />
        )}

        {!pacientes.carregando && !pacientes.erro && lista.length > 0 && (
          <section className="pacientes" aria-label="Pacientes vinculados">
            {lista.map((paciente) => (
              <PacienteLinha key={paciente.id} paciente={paciente} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function PacienteLinha({ paciente }: { paciente: PacienteResumo }) {
  const progresso =
    paciente.hoje.total === 0
      ? 0
      : Math.round((paciente.hoje.concluidas / paciente.hoje.total) * 100);

  return (
    <article className="paciente">
      <div className="paciente__identidade">
        <h2 className="paciente__nome">{paciente.nome}</h2>
        <p className="paciente__email">{paciente.email}</p>
      </div>

      <div className="paciente__hoje">
        <span className="paciente__progresso-numero">
          {paciente.hoje.concluidas}/{paciente.hoje.total}
        </span>
        <Barra
          valor={progresso}
          rotulo={`Progresso de hoje de ${paciente.nome}`}
          className="paciente__progresso-trilho"
        />
      </div>

      <div className="paciente__consistencia">
        {paciente.atrasadas > 0 && (
          <span className="paciente__atrasadas">
            {paciente.atrasadas} atrasada{paciente.atrasadas > 1 ? 's' : ''}
          </span>
        )}
        {paciente.streak > 0 && (
          <span>
            {paciente.streak} {paciente.streak === 1 ? 'dia' : 'dias'}
          </span>
        )}
        {paciente.atrasadas === 0 && paciente.streak === 0 && '—'}
      </div>

      <Link
        to={`/psicologo/paciente/${paciente.id}`}
        className="paciente__acao"
        aria-label={`Ver rotina de ${paciente.nome}`}
      >
        Ver rotina
        <Icone nome="chevron-right" tamanho={13} />
      </Link>
    </article>
  );
}
