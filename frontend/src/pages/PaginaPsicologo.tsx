import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { Botao } from '../components/Botao';
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
        <div className="pagina__linha">
          <div>
            <h1 className="titulo-pagina">Meus pacientes</h1>
            <p className="resumo">
              {lista.length}{' '}
              {pluralizar(lista.length, 'paciente vinculado', 'pacientes vinculados')}
            </p>
          </div>
        </div>

        <section className="secao codigo-secao" aria-label="Código de vínculo">
          <div className="codigo">
            <div>
              <p className="codigo__rotulo">Código de vínculo</p>
              <p className="codigo__valor">{usuario?.codigo ?? '—'}</p>
              <p className="campo-ajuda">
                Compartilhe com seus pacientes — eles entram com este código
                para criar o vínculo.
              </p>
            </div>
            <Botao variante="fantasma" onClick={() => void aoCopiar()}>
              <Icone nome="copy" tamanho={14} />
              {copiado ? 'Copiado' : 'Copiar'}
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
            <div className="pacientes__cabecalho" aria-hidden="true">
              <span>Paciente</span>
              <span>Hoje</span>
              <span>Atrasadas</span>
              <span>Streak</span>
              <span />
            </div>
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
  return (
    <article className="paciente">
      <div className="paciente__identidade">
        <h3 className="paciente__nome">{paciente.nome}</h3>
        <p className="paciente__email">{paciente.email}</p>
      </div>
      <div className="paciente__dado">
        {paciente.hoje.concluidas}/{paciente.hoje.total}
      </div>
      <div className="paciente__dado">
        {paciente.atrasadas > 0 ? (
          <span className="atrasadas">{paciente.atrasadas}</span>
        ) : (
          '—'
        )}
      </div>
      <div className="paciente__dado">
        {paciente.streak > 0 ? `${paciente.streak} d` : '—'}
      </div>
      <div className="paciente__acao">
        <Link
          to={`/psicologo/paciente/${paciente.id}`}
          className="btn btn--icone"
          aria-label={`Ver rotina de ${paciente.nome}`}
          title="Ver rotina"
        >
          <Icone nome="chevron-right" tamanho={15} />
        </Link>
      </div>
    </article>
  );
}
