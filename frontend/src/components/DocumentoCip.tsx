import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';
import { formatarDataLonga } from '../lib/dates';
import { mensagemErro } from '../lib/errors';
import {
  baixarDocumentoCip,
  enviarDocumentoCip,
  removerDocumentoCip,
} from '../lib/rithmo';
import type { Usuario } from '../types';

type Documento = NonNullable<Usuario['documento']>;

const TIPOS_ACEITOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAX = 10 * 1024 * 1024;

function lerComoDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(arquivo);
  });
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

function rotuloTipo(tipo: string): string {
  return tipo === 'application/pdf' ? 'PDF' : 'Imagem';
}

/**
 * Anexo da Carteira de Identidade Profissional (CIP), emitida pelo CRP.
 * Aceita PDF ou foto (JPG, PNG, WEBP) de até 10 MB. Só o próprio psicólogo
 * vê o arquivo; aqui ele pode anexar, visualizar, trocar ou remover.
 */
export function DocumentoCip({ documento }: { documento: Documento | null }) {
  const toast = useToast();
  const { usuario, atualizarUsuario } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  const salvarNoPerfil = (novo: Documento | null) => {
    if (!usuario) return;
    atualizarUsuario({ ...usuario, documento: novo });
  };

  const enviarArquivo = async (arquivo: File) => {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      toast.mostrar('Envie a CIP em PDF ou foto (JPG, PNG ou WEBP).', 'erro');
      return;
    }
    if (arquivo.size > TAMANHO_MAX) {
      toast.mostrar('Esse arquivo passa de 10 MB.', 'erro');
      return;
    }

    setEnviando(true);
    try {
      const dataUrl = await lerComoDataUrl(arquivo);
      const resposta = await enviarDocumentoCip(dataUrl, arquivo.name);
      salvarNoPerfil(resposta.documento);
      setConfirmandoRemocao(false);
      toast.mostrar(documento ? 'CIP substituída.' : 'CIP anexada!');
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível anexar a CIP'), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  const aoEscolher = (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (arquivo) void enviarArquivo(arquivo);
  };

  const aoSoltar = (evento: DragEvent<HTMLDivElement>) => {
    evento.preventDefault();
    setArrastando(false);
    const arquivo = evento.dataTransfer.files?.[0];
    if (arquivo) void enviarArquivo(arquivo);
  };

  const visualizar = async () => {
    setEnviando(true);
    try {
      const blob = await baixarDocumentoCip();
      const url = URL.createObjectURL(new Blob([blob], { type: documento?.tipo }));
      window.open(url, '_blank', 'noopener');
      // dá tempo do navegador abrir antes de liberar a URL
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível abrir a CIP'), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  const remover = async () => {
    setEnviando(true);
    try {
      await removerDocumentoCip();
      salvarNoPerfil(null);
      setConfirmandoRemocao(false);
      toast.mostrar('CIP removida.');
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível remover a CIP'), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  const inputArquivo = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,image/jpeg,image/png,image/webp"
      className="cip__input"
      aria-label="Escolher arquivo da CIP"
      onChange={aoEscolher}
    />
  );

  return (
    <section className="cip" aria-labelledby="cip-titulo">
      <header className="cip__cabecalho">
        <p className="cip__sigla">CIP · CRP</p>
        <h2 id="cip-titulo" className="cip__titulo">
          Carteira de Identidade Profissional
        </h2>
        <p className="cip__legenda">
          Documento emitido pelo Conselho Regional de Psicologia que comprova sua
          habilitação. Aceita PDF ou foto (JPG, PNG, WEBP), até 10 MB. Só você
          consegue ver o arquivo.
        </p>
      </header>

      {documento ? (
        <div className="cip__anexo">
          <span className="cip__icone" aria-hidden="true">
            <Icone nome="arquivo" tamanho={22} />
          </span>
          <div className="cip__dados">
            <span className="cip__nome" title={documento.nome}>
              {documento.nome}
            </span>
            <span className="cip__meta">
              {rotuloTipo(documento.tipo)} · {formatarTamanho(documento.tamanho)} ·
              enviada em {formatarDataLonga(documento.enviadoEm)}
            </span>
          </div>

          <div className="cip__acoes">
            <Botao variante="fantasma" onClick={() => void visualizar()} carregando={enviando}>
              <Icone nome="externo" tamanho={13} />
              Visualizar
            </Botao>
            <Botao variante="fantasma" onClick={() => inputRef.current?.click()} disabled={enviando}>
              <Icone nome="upload" tamanho={13} />
              Trocar
            </Botao>
            {confirmandoRemocao ? (
              <>
                <Botao variante="perigo" onClick={() => void remover()} disabled={enviando}>
                  Confirmar remoção
                </Botao>
                <Botao variante="fantasma" onClick={() => setConfirmandoRemocao(false)} disabled={enviando}>
                  Cancelar
                </Botao>
              </>
            ) : (
              <Botao variante="fantasma" onClick={() => setConfirmandoRemocao(true)} disabled={enviando}>
                Remover
              </Botao>
            )}
          </div>
          {inputArquivo}
        </div>
      ) : (
        <div
          className={`cip__soltar${arrastando ? ' cip__soltar--ativo' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={aoSoltar}
        >
          <span className="cip__icone cip__icone--grande" aria-hidden="true">
            <Icone nome="upload" tamanho={24} />
          </span>
          <p className="cip__chamada">Arraste a CIP para cá</p>
          <p className="cip__subchamada">ou escolha um arquivo do seu aparelho</p>
          <Botao onClick={() => inputRef.current?.click()} carregando={enviando}>
            Anexar CIP
          </Botao>
          {inputArquivo}
        </div>
      )}
    </section>
  );
}
