import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Botao } from '../components/Botao';
import { DocumentoCip } from '../components/DocumentoCip';
import { Cabecalho } from '../components/Cabecalho';
import { Icone } from '../components/Icone';
import { ModalEditarPerfil } from '../components/ModalEditarPerfil';
import { ModalAlterarSenha } from '../components/ModalAlterarSenha.tsx'; // NOVO
import { SecaoConsistencia } from '../components/SecaoConsistencia';
import { SecaoVinculo } from '../components/SecaoVinculo';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useProgresso, useVinculoPaciente } from '../hooks/dados';
import { formatarDataLonga } from '../lib/dates';
import { primeiroNome } from '../lib/nomes';
import { mensagemErro } from '../lib/errors';
import { atualizarFotoPerfil, obterMeuPerfil } from '../lib/rithmo';
import type { Usuario } from '../types';

const LADO_FOTO = 320; // px — tamanho final salvo (já recortado em quadrado)

/** NOVO — lê o arquivo, recorta em quadrado (centralizado) e redimensiona,
 *  pra não mandar pro servidor uma imagem gigante do celular/câmera. */
async function prepararFoto(arquivo: File): Promise<string> {
  const dataUrlOriginal = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    leitor.readAsDataURL(arquivo);
  });

  const imagem = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Esse arquivo não é uma imagem válida.'));
    img.src = dataUrlOriginal;
  });

  const lado = Math.min(imagem.width, imagem.height);
  const origemX = (imagem.width - lado) / 2;
  const origemY = (imagem.height - lado) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = LADO_FOTO;
  canvas.height = LADO_FOTO;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem.');
  ctx.drawImage(imagem, origemX, origemY, lado, lado, 0, 0, LADO_FOTO, LADO_FOTO);

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * NOVO — Avatar com upload: clique na foto (ou no lápis) abre o seletor
 * de arquivo. A imagem é recortada/comprimida no navegador antes de ir
 * pro servidor (ver prepararFoto). "Remover foto" some quando não há foto.
 */
function FotoPerfil({ usuario }: { usuario: Usuario }) {
  const toast = useToast();
  const { atualizarUsuario } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  const aoEscolherArquivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      toast.mostrar('Escolha um arquivo de imagem.', 'erro');
      return;
    }
    if (arquivo.size > 8 * 1024 * 1024) {
      toast.mostrar('Essa imagem é grande demais (máx. 8MB).', 'erro');
      return;
    }

    setEnviando(true);
    try {
      const fotoUrl = await prepararFoto(arquivo);
      const resposta = await atualizarFotoPerfil(fotoUrl);
      atualizarUsuario(resposta.usuario);
      toast.mostrar('Foto de perfil atualizada!');
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível atualizar a foto'), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  const aoRemover = async () => {
    setEnviando(true);
    try {
      const resposta = await atualizarFotoPerfil(null);
      atualizarUsuario(resposta.usuario);
      toast.mostrar('Foto removida.');
    } catch (e) {
      toast.mostrar(mensagemErro(e, 'Não foi possível remover a foto'), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="perfil-foto">
      <button
        type="button"
        className="perfil-foto__botao"
        onClick={() => inputRef.current?.click()}
        disabled={enviando}
        aria-label={usuario.fotoUrl ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'}
        title={usuario.fotoUrl ? 'Trocar foto' : 'Adicionar foto'}
      >
        {usuario.fotoUrl ? (
          <img src={usuario.fotoUrl} alt="" className="perfil-foto__imagem" />
        ) : (
          <Icone nome="user" tamanho={28} />
        )}
        <span className="perfil-foto__lapis" aria-hidden="true">
          <Icone nome="pencil" tamanho={12} />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="perfil-foto__input"
        onChange={(e) => void aoEscolherArquivo(e)}
      />

      {usuario.fotoUrl && (
        <button
          type="button"
          className="perfil-foto__remover"
          onClick={() => void aoRemover()}
          disabled={enviando}
        >
          Remover foto
        </button>
      )}
    </div>
  );
}

/**
 * NOVO — Bloco de apoio exclusivo do paciente (ritmo/conquistas + vínculo).
 * Fica num componente à parte porque usa hooks que buscam dados que só
 * existem pra paciente (useProgresso, useVinculoPaciente) — mantendo-os
 * aqui, eles só rodam quando este componente é montado (perfil = paciente),
 * em vez de disparar pra psicólogo também.
 */
function ApoioPaciente() {
  const toast = useToast();
  const progresso = useProgresso();
  const vinculo = useVinculoPaciente();

  const aoVincular = async (codigo: string) => {
    await vinculo.vincular(codigo);
  };

  return (
    <aside className="coluna-apoio">
      {progresso.dados && <SecaoConsistencia progresso={progresso.dados} />}
      <SecaoVinculo
        psicologo={vinculo.psicologo}
        carregando={vinculo.carregando}
        onVincular={aoVincular}
        onSucesso={(mensagem) => toast.mostrar(mensagem)}
        onErro={(mensagem) => toast.mostrar(mensagem, 'erro')}
      />
    </aside>
  );
}

/**
 * Perfil: a ficha de dados da própria conta — nome, e-mail, tipo de
 * conta e, pro paciente, o mesmo ritmo/conquistas e vínculo da Home.
 * Mesma linguagem das outras páginas: pauta de linhas finas, sem card.
 */
export function PaginaPerfil() {
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, sair, atualizarUsuario } = useAuth();

  const ehPaciente = usuario!.perfil === 'paciente';
  const [editando, setEditando] = useState(false);
  const [trocandoSenha, setTrocandoSenha] = useState(false); // NOVO

  // NOVO — a sessão salva no navegador só tem o que veio no login; números
  // como "pacientes vinculados" podem ter mudado desde então (ex.: alguém
  // vinculou depois). Busca a versão atual assim que a página abre.
  useEffect(() => {
    obterMeuPerfil()
      .then((resposta) => atualizarUsuario(resposta.usuario))
      .catch(() => {
        // Sem toast aqui: a página já mostra os dados da sessão (um
        // pouco desatualizados, na pior das hipóteses) mesmo se isso falhar.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  return (
    <div className="container">
      <Cabecalho usuario={usuario!} onSair={aoSair} />

      <main className="pagina">
        <section className="dia-faixa dia-faixa--perfil" aria-label="Seu perfil">
          <FotoPerfil usuario={usuario!} />
          <div>
            <p className="dia-faixa__eyebrow">Perfil</p>
            <h1 className="dia-faixa__titulo">{primeiroNome(usuario!.nome)}</h1>
            <span className="perfil-tipo">
              {ehPaciente ? 'Paciente' : 'Psicólogo(a)'}
            </span>
          </div>
        </section>

        <div className="grade-dia">
          <section className="coluna-rotina" aria-label="Seus dados">
            <header className="rotina-cabecalho">
              <div>
                <h2 className="rotina-cabecalho__titulo">Seus dados</h2>
                <p className="rotina-cabecalho__legenda">
                  Informações da sua conta no RITHMO.
                </p>
              </div>
              <div className="rotina-cabecalho__acoes">
                {/* NOVO — abre o modal de edição de nome/e-mail */}
                <Botao variante="fantasma" onClick={() => setEditando(true)}>
                  <Icone nome="pencil" tamanho={13} />
                  Editar
                </Botao>
                {/* NOVO — abre o modal de troca de senha */}
                <Botao variante="fantasma" onClick={() => setTrocandoSenha(true)}>
                  Alterar senha
                </Botao>
              </div>
            </header>

            <dl className="perfil-ficha">
              <div className="perfil-ficha__linha">
                <dt>Nome</dt>
                <dd>{usuario!.nome}</dd>
              </div>

              <div className="perfil-ficha__linha">
                <dt>E-mail</dt>
                <dd>{usuario!.email}</dd>
              </div>

              {usuario!.criadoEm && (
                <div className="perfil-ficha__linha">
                  <dt>Na plataforma desde</dt>
                  <dd>{formatarDataLonga(usuario!.criadoEm)}</dd>
                </div>
              )}

              {!ehPaciente && usuario!.codigo && (
                <div className="perfil-ficha__linha">
                  <dt>Código de convite</dt>
                  <dd className="perfil-ficha__codigo">{usuario!.codigo}</dd>
                </div>
              )}

              {!ehPaciente && (
                <div className="perfil-ficha__linha">
                  <dt>Pacientes vinculados</dt>
                  <dd>{usuario!.pacientesVinculados ?? 0}</dd>
                </div>
              )}

              {ehPaciente && usuario!.psicologoVinculado && (
                <div className="perfil-ficha__linha">
                  <dt>Psicólogo(a)</dt>
                  <dd>{usuario!.psicologoVinculado.nome}</dd>
                </div>
              )}
            </dl>
          </section>

          {ehPaciente && <ApoioPaciente />}

          {/* CIP — documento de registro do CRP, só para psicólogos */}
          {!ehPaciente && (
            <aside className="coluna-apoio">
              <DocumentoCip documento={usuario!.documento ?? null} />
            </aside>
          )}
        </div>
      </main>

      <ModalEditarPerfil
        aberto={editando}
        usuario={usuario!}
        onFechar={() => setEditando(false)}
        onSucesso={() => toast.mostrar('Dados atualizados!')}
      />

      <ModalAlterarSenha
        aberto={trocandoSenha}
        onFechar={() => setTrocandoSenha(false)}
        onSucesso={() => toast.mostrar('Senha alterada!')}
      />
    </div>
  );
}