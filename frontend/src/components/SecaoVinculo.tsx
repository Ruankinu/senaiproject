import { useState, type FormEvent } from 'react';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { mensagemErro } from '../lib/errors';
import type { Usuario } from '../types';

interface SecaoVinculoProps {
  psicologo: Usuario['psicologoVinculado'];
  carregando: boolean;
  onVincular: (codigo: string) => Promise<void>;
  onSucesso: (mensagem: string) => void;
  onErro: (mensagem: string) => void;
}

/** Área de vínculo do paciente: estado atual ou entrada do código. */
export function SecaoVinculo({
  psicologo,
  carregando,
  onVincular,
  onSucesso,
  onErro,
}: SecaoVinculoProps) {
  const [codigo, setCodigo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const aoEnviar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!codigo.trim()) return;

    setEnviando(true);
    try {
      await onVincular(codigo.trim());
      onSucesso('Vínculo criado com sucesso.');
      setCodigo('');
    } catch (e) {
      onErro(mensagemErro(e, 'Não foi possível criar o vínculo'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="secao" aria-label="Seu psicólogo">
      <header className="secao__cabecalho">
        <h2 className="secao__titulo">Seu psicólogo</h2>
        {psicologo && (
          <p className="secao__meta">Vínculo ativo · {psicologo.nome}</p>
        )}
      </header>

      {carregando ? (
        <p className="secao__meta">Carregando…</p>
      ) : psicologo ? (
        <p className="vinculo-ativo">
          <Icone nome="user" tamanho={15} />
          <span>
            <strong>{psicologo.nome}</strong>
            <span className="vinculo-ativo__email">{psicologo.email}</span>
          </span>
        </p>
      ) : (
        <form className="vinculo-form" onSubmit={aoEnviar}>
          <div className="campo">
            <label htmlFor="campo-codigo">Código do psicólogo</label>
            <div className="vinculo-form__linha">
              <input
                id="campo-codigo"
                type="text"
                value={codigo}
                maxLength={8}
                placeholder="Ex.: RITMO1"
                autoComplete="off"
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              />
              <Botao type="submit" carregando={enviando}>
                Vincular
              </Botao>
            </div>
            <p className="campo-ajuda">
              Peça o código ao seu psicólogo. Ele aparece na conta dele.
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
