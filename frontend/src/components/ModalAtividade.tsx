import { useState, type FormEvent } from 'react';
import { Botao } from './Botao';
import { Dialogo, DialogoTitulo } from './Dialogo';
import type { Atividade } from '../types';
import { COMPLEXIDADES, PRIORIDADES } from '../types';
import { hojeISO } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import type { DadosAtividade } from '../lib/rithmo';

interface ModalAtividadeProps {
  aberto: boolean;
  atividade?: Atividade | null;
  onFechar: () => void;
  onSubmit: (dados: DadosAtividade, id?: number) => Promise<void>;
}

interface Erros {
  titulo?: string;
  prazo?: string;
}

export function ModalAtividade({
  aberto,
  atividade,
  onFechar,
  onSubmit,
}: ModalAtividadeProps) {
  const editando = Boolean(atividade);
  const [titulo, setTitulo] = useState(atividade?.titulo ?? '');
  const [descricao, setDescricao] = useState(atividade?.descricao ?? '');
  const [prazo, setPrazo] = useState(atividade?.prazo || hojeISO());
  const [horario, setHorario] = useState(atividade?.horario ?? '');
  const [prioridade, setPrioridade] = useState(atividade?.prioridade ?? 'Média');
  const [complexidade, setComplexidade] = useState(
    atividade?.complexidade ?? 'Moderada',
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Erros>({});

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();

    const novos: Erros = {};
    if (!titulo.trim()) novos.titulo = 'Informe um título para a atividade.';
    if (!prazo) novos.prazo = 'Defina a data.';

    if (Object.keys(novos).length > 0) {
      setErros(novos);
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await onSubmit(
        {
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          prazo,
          horario,
          prioridade,
          complexidade,
        },
        atividade?.id,
      );
      onFechar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar a atividade'));
      setEnviando(false);
    }
  };

  return (
    <Dialogo
      aberto={aberto}
      onFechar={onFechar}
      rotulo="titulo-atividade"
    >
      <DialogoTitulo id="titulo-atividade">
        {editando ? 'Editar atividade' : 'Nova atividade'}
      </DialogoTitulo>

      <form className="formulario" onSubmit={aoEnviar} noValidate>
        <div className="campo">
          <label htmlFor="campo-titulo">Título</label>
          <input
            id="campo-titulo"
            type="text"
            value={titulo}
            maxLength={200}
            placeholder="Ex.: Meditação pela manhã"
            autoComplete="off"
            aria-invalid={Boolean(erros.titulo)}
            onChange={(e) => setTitulo(e.target.value)}
          />
          {erros.titulo && <p className="campo-erro">{erros.titulo}</p>}
        </div>

        <div className="campo">
          <label htmlFor="campo-descricao">Descrição</label>
          <textarea
            id="campo-descricao"
            value={descricao}
            rows={3}
            placeholder="O que precisa ser feito?"
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="formulario__linha dois">
          <div className="campo">
            <label htmlFor="campo-prazo">Data</label>
            <input
              id="campo-prazo"
              type="date"
              value={prazo}
              aria-invalid={Boolean(erros.prazo)}
              onChange={(e) => setPrazo(e.target.value)}
            />
            {erros.prazo && <p className="campo-erro">{erros.prazo}</p>}
          </div>
          <div className="campo">
            <label htmlFor="campo-horario">Horário (opcional)</label>
            <input
              id="campo-horario"
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            />
          </div>
        </div>

        <fieldset className="campo">
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

        <fieldset className="campo">
          <legend>Complexidade</legend>
          <div className="segmentado" role="radiogroup" aria-label="Complexidade">
            {COMPLEXIDADES.map((opcao) => (
              <label key={opcao} className="segmentado__opcao">
                <input
                  type="radio"
                  name="complexidade"
                  value={opcao}
                  checked={complexidade === opcao}
                  onChange={() => setComplexidade(opcao)}
                />
                <span>
                  <span className="complexidade" aria-hidden="true">
                    {[0, 1, 2].map((indice) => (
                      <i
                        key={indice}
                        className={
                          indice <
                          (opcao === 'Intensa' ? 3 : opcao === 'Moderada' ? 2 : 1)
                            ? 'cheio'
                            : ''
                        }
                      />
                    ))}
                  </span>
                  {opcao}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {erro && (
          <p className="formulario__erro" role="alert">
            {erro}
          </p>
        )}

        <div className="formulario__acoes">
          <Botao type="button" variante="fantasma" onClick={onFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" carregando={enviando}>
            {editando ? 'Salvar alterações' : 'Adicionar atividade'}
          </Botao>
        </div>
      </form>
    </Dialogo>
  );
}
