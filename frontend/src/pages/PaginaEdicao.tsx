import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { FormularioTarefa } from '../components/FormularioTarefa';
import { useToast } from '../components/Toast';
import { useBuscarTarefa } from '../hooks/useTarefas';
import { atualizarTarefa } from '../lib/tasks';
import { formatarCriacao } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import type { TarefaPayload } from '../types/task';

/**
 * Edição com a mesma linguagem do cadastro: fica claro o que está sendo
 * editado e qual ação salvará as alterações.
 */
export function PaginaEdicao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { tarefa, carregando, naoEncontrada } = useBuscarTarefa(id);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const aoSalvar = async (dados: TarefaPayload) => {
    if (!id) return;
    setEnviando(true);
    setErroForm(null);
    try {
      await atualizarTarefa(id, dados);
      toast.mostrar('Alterações salvas.');
      navigate('/');
    } catch (e) {
      setErroForm(mensagemErro(e, 'Não foi possível salvar as alterações'));
      setEnviando(false);
    }
  };

  return (
    <div className="container">
      <Cabecalho />

      <main className="pagina pagina--estreita">
        {carregando && (
          <div className="esqueleto-form" aria-hidden="true">
            <span className="esqueleto__linha esqueleto__linha--titulo" />
            <span className="esqueleto__linha" />
            <span className="esqueleto__linha" />
          </div>
        )}

        {!carregando && naoEncontrada && (
          <section className="erro-painel" role="alert">
            <h2>Tarefa não encontrada.</h2>
            <p>Ela pode ter sido excluída ou o endereço está incorreto.</p>
            <Link to="/" className="btn btn--fantasma">
              Voltar para suas tarefas
            </Link>
          </section>
        )}

        {!carregando && !naoEncontrada && tarefa && (
          <>
            <div className="pagina__cabecalho">
              <h1 className="titulo-pagina">Editar tarefa</h1>
              <p className="resumo">
                Criada em {formatarCriacao(tarefa.criado_em)} ·{' '}
                {tarefa.id !== undefined ? `ID ${tarefa.id}` : ''}
              </p>
            </div>

            <FormularioTarefa
              inicial={tarefa}
              rotuloEnvio="Salvar alterações"
              enviando={enviando}
              erro={erroForm}
              incluirStatus
              onEnviar={aoSalvar}
              onCancelar={() => navigate('/')}
            />
          </>
        )}
      </main>
    </div>
  );
}
