import { useState, type FormEvent } from 'react';
import { Botao } from './Botao';
import { Icone } from './Icone';
import type { Tarefa, TarefaPayload } from '../types/task';
import { PRIORIDADES, STATUS, ehConcluida } from '../types/task';

interface FormularioTarefaProps {
  inicial?: Tarefa | null;
  rotuloEnvio: string;
  enviando: boolean;
  erro?: string | null;
  incluirStatus?: boolean;
  onEnviar: (dados: TarefaPayload) => void;
  onCancelar?: () => void;
}

interface Erros {
  titulo?: string;
  tarefa?: string;
  prazo?: string;
}

export function FormularioTarefa({
  inicial,
  rotuloEnvio,
  enviando,
  erro,
  incluirStatus = false,
  onEnviar,
  onCancelar,
}: FormularioTarefaProps) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [tarefa, setTarefa] = useState(inicial?.tarefa ?? '');
  const [prazo, setPrazo] = useState(inicial?.prazo ?? '');
  const [prioridade, setPrioridade] = useState(inicial?.prioridade ?? 'Média');
  const [status, setStatus] = useState(
    inicial ? (ehConcluida(inicial) ? 'Concluída' : 'Pendente') : 'Pendente',
  );
  const [erros, setErros] = useState<Erros>({});

  const aoEnviar = (evento: FormEvent) => {
    evento.preventDefault();

    const proximos: Erros = {};
    if (!titulo.trim()) proximos.titulo = 'Informe um título para a tarefa.';
    if (!tarefa.trim()) proximos.tarefa = 'Descreva brevemente a tarefa.';
    if (!prazo) proximos.prazo = 'Defina um prazo.';

    if (Object.keys(proximos).length > 0) {
      setErros(proximos);
      return;
    }

    setErros({});
    onEnviar({
      titulo: titulo.trim(),
      tarefa: tarefa.trim(),
      prazo,
      prioridade,
      ...(incluirStatus ? { status } : {}),
    });
  };

  return (
    <form className="formulario" onSubmit={aoEnviar} noValidate>
      <div className="campo">
        <label htmlFor="campo-titulo">Título</label>
        <input
          id="campo-titulo"
          type="text"
          value={titulo}
          maxLength={200}
          placeholder="Ex.: Revisar apresentação da semana"
          autoComplete="off"
          aria-invalid={Boolean(erros.titulo)}
          onChange={(e) => setTitulo(e.target.value)}
        />
        {erros.titulo && <p className="campo-erro">{erros.titulo}</p>}
      </div>

      <div className="campo">
        <label htmlFor="campo-tarefa">Descrição</label>
        <textarea
          id="campo-tarefa"
          value={tarefa}
          rows={3}
          placeholder="O que precisa ser feito?"
          aria-invalid={Boolean(erros.tarefa)}
          onChange={(e) => setTarefa(e.target.value)}
        />
        {erros.tarefa && <p className="campo-erro">{erros.tarefa}</p>}
      </div>

      <div className="formulario__linha">
        <div className="campo campo--prazo">
          <label htmlFor="campo-prazo">Prazo</label>
          <input
            id="campo-prazo"
            type="date"
            value={prazo}
            aria-invalid={Boolean(erros.prazo)}
            onChange={(e) => setPrazo(e.target.value)}
          />
          {erros.prazo && <p className="campo-erro">{erros.prazo}</p>}
        </div>

        <fieldset className="campo campo--prioridade">
          <legend>Prioridade</legend>
          <div className="segmentado" role="radiogroup" aria-label="Prioridade">
            {PRIORIDADES.map((opcao) => (
              <label
                key={opcao}
                className={`segmentado__opcao segmentado__opcao--${opcao
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')}`}
              >
                <input
                  type="radio"
                  name="prioridade"
                  value={opcao}
                  checked={prioridade === opcao}
                  onChange={() => setPrioridade(opcao)}
                />
                <span>
                  <i className="ponto" aria-hidden="true" />
                  {opcao}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {incluirStatus && (
        <fieldset className="campo">
          <legend>Status</legend>
          <div className="segmentado" role="radiogroup" aria-label="Status">
            {STATUS.map((opcao) => (
              <label key={opcao} className="segmentado__opcao">
                <input
                  type="radio"
                  name="status"
                  value={opcao}
                  checked={status === opcao}
                  onChange={() => setStatus(opcao)}
                />
                <span>{opcao}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {erro && (
        <p className="formulario__erro" role="alert">
          <Icone nome="x" tamanho={14} />
          {erro}
        </p>
      )}

      <div className="formulario__acoes">
        {onCancelar && (
          <Botao type="button" variante="fantasma" onClick={onCancelar}>
            Cancelar
          </Botao>
        )}
        <Botao type="submit" carregando={enviando}>
          {rotuloEnvio}
        </Botao>
      </div>
    </form>
  );
}
