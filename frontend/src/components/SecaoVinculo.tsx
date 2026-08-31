import { useState, type FormEvent } from 'react';
import { Botao } from './Botao';
import { mensagemErro } from '../lib/errors';
import type { Usuario } from '../types';

interface SecaoVinculoProps {
  psicologo: Usuario['psicologoVinculado'];
  carregando: boolean;
  onVincular: (codigo: string) => Promise<void>;
  onSucesso: (mensagem: string) => void;
  onErro: (mensagem: string) => void;
}

/** Coluna de apoio: vínculo em uma linha discreta (ou formulário compacto). */
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
    <section className="ritmo-bloco" aria-label="Seu psicólogo">
      <span className="ritmo-bloco__rotulo">Seu psicólogo</span>

      {carregando ? (
        <p className="ritmo-metrica__extra">Carregando…</p>
      ) : psicologo ? (
        <div className="vinculo">
          <span className="vinculo__pessoa">{psicologo.nome}</span>
          <span className="vinculo__meta">{psicologo.email}</span>
        </div>
      ) : (
        <form className="vinculo-form" onSubmit={aoEnviar}>
          <div className="campo campo--regua vinculo-form__campo">
            <label htmlFor="campo-codigo">Código do psicólogo</label>
            <input
              id="campo-codigo"
              type="text"
              value={codigo}
              maxLength={8}
              placeholder="Ex.: RITMO1"
              autoComplete="off"
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            />
            <p className="campo-ajuda">
              Peça o código ao seu psicólogo — ele aparece na conta dele.
            </p>
          </div>
          <Botao type="submit" carregando={enviando}>
            Vincular
          </Botao>
        </form>
      )}
    </section>
  );
}
