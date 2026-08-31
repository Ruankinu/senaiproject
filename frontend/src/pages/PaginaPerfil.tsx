import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cabecalho } from '../components/Cabecalho';
import { Marca } from '../components/Marca';
import { Icone } from '../components/Icone';
import { Botao } from '../components/Botao';
import { Esqueleto } from '../components/Esqueleto';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useProgresso } from '../hooks/dados';
import { api } from '../lib/api';
import type { Usuario } from '../types';

interface PerfilCompleto extends Usuario {
  pacientesVinculados?: number;
  psicologoVinculado?: { id: number; nome: string; email: string } | null;
}

/** Descrições de apresentação das conquistas (nunca revelam a condição). */
const DESCRICOES: Record<string, string> = {
  'primeiro-passo': 'Você começou o seu ritmo.',
  'sete-dias': 'Uma semana em movimento.',
  'um-mes': 'Um mês de constância.',
  'seis-meses': 'Meio ano no seu compasso.',
  'um-ano': 'Um ano inteiro de ritmo.',
};

function Emblema({ id }: { id: string }) {
  switch (id) {
    case 'primeiro-passo':
      return <Icone nome="check" tamanho={22} />;
    case 'sete-dias':
      return <Icone nome="calendar" tamanho={22} />;
    case 'um-mes':
      return <Icone nome="flame" tamanho={22} />;
    case 'seis-meses':
      return <Icone nome="trophy" tamanho={22} />;
    default:
      return <Icone nome="users" tamanho={22} />;
  }
}

export function PaginaPerfil() {
  const navigate = useNavigate();
  const toast = useToast();
  const { usuario, sair } = useAuth();
  const progresso = useProgresso();
  const [perfil, setPerfil] = useState<PerfilCompleto | null>(usuario);
  const [copiado, setCopiado] = useState(false);

  // Atualiza com os dados completos do /me existente (código, vínculo,
  // pacientes) — apenas leitura, sem alterar o backend.
  useEffect(() => {
    let ativo = true;
    api
      .get<{ usuario: PerfilCompleto }>('/me')
      .then((resposta) => {
        if (ativo) setPerfil(resposta.usuario);
      })
      .catch(() => {
        /* segue com a sessão local do protótipo */
      });
    return () => {
      ativo = false;
    };
  }, []);

  const aoSair = () => {
    sair();
    navigate('/login', { replace: true });
  };

  const aoCopiarCodigo = async () => {
    const codigo = perfil?.codigo ?? '';
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast.mostrar('Código copiado.');
      window.setTimeout(() => setCopiado(false), 1600);
    } catch {
      toast.mostrar('Não foi possível copiar o código.', 'erro');
    }
  };

  const ehPsicologo = perfil?.perfil === 'psicologo';
  const conquistadas =
    progresso.dados?.badges.filter((badge) => badge.aberta) ?? [];

  return (
    <div className="container">
      <Cabecalho usuario={usuario!} onSair={aoSair} />

      <main className="pagina">
        <header className="saudacao">
          <div>
            <p className="saudacao__rotulo">Perfil</p>
            <h1 className="saudacao__titulo">Sua identidade</h1>
          </div>
        </header>

        <section
          className="cartao perfil-hero"
          aria-label="Identidade do usuário"
        >
          <span className="perfil-hero__avatar" aria-hidden="true">
            <Marca comPalavra={false} tamanho="media" />
          </span>
          <div className="perfil-hero__identidade">
            <h2 className="perfil-hero__nome">{perfil?.nome ?? '—'}</h2>
            <p className="perfil-hero__email">{perfil?.email ?? ''}</p>
            <div className="perfil-hero__tags">
              <span className="tag tag--roxo">
                {ehPsicologo ? 'Psicóloga' : 'Paciente'}
              </span>
              {!ehPsicologo && conquistadas.length > 0 && (
                <span className="tag tag--verde">
                  <Icone nome="trophy" tamanho={12} />
                  {conquistadas.length}{' '}
                  {conquistadas.length === 1 ? 'conquista' : 'conquistas'}
                </span>
              )}
            </div>
          </div>
          <div className="perfil-hero__acoes">
            {ehPsicologo && (
              <Botao variante="fantasma" onClick={() => void aoCopiarCodigo()}>
                <Icone nome="copy" tamanho={14} />
                {copiado ? 'Copiado' : 'Copiar código'}
              </Botao>
            )}
          </div>
        </section>

        <div className="perfil-corpo">
          <div className="perfil-coluna">
            <section className="cartao apoio-card" aria-label="Informações">
              <span className="apoio-card__rotulo">Informações</span>
              <div className="info-lista">
                <div className="info-item">
                  <span className="info-item__rotulo">Nome</span>
                  <span className="info-item__valor">{perfil?.nome ?? '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-item__rotulo">E-mail</span>
                  <span className="info-item__valor">{perfil?.email ?? '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-item__rotulo">Data de nascimento</span>
                  <span className="info-item__valor">—</span>
                  <span className="info-item__nota">
                    Campo disponível em breve
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-item__rotulo">Perfil</span>
                  <span className="info-item__valor">
                    {ehPsicologo ? 'Psicóloga' : 'Paciente'}
                  </span>
                </div>
                {ehPsicologo && (
                  <>
                    <div className="info-item">
                      <span className="info-item__rotulo">Código de vínculo</span>
                      <span className="info-item__valor">
                        {perfil?.codigo ?? '—'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-item__rotulo">Pacientes</span>
                      <span className="info-item__valor">
                        {perfil?.pacientesVinculados ?? 0} vinculados
                      </span>
                    </div>
                  </>
                )}
                {!ehPsicologo && perfil?.psicologoVinculado && (
                  <div className="info-item">
                    <span className="info-item__rotulo">Seu psicólogo</span>
                    <span className="info-item__valor">
                      {perfil.psicologoVinculado.nome}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {ehPsicologo && (
              <section className="cartao apoio-card" aria-label="Acompanhamento">
                <span className="apoio-card__rotulo">Acompanhamento</span>
                <p className="info-item__nota" style={{ margin: 0 }}>
                  As rotinas dos seus pacientes ficam em{' '}
                  <strong>Pacientes</strong>, no topo da página.
                </p>
              </section>
            )}
          </div>

          <div className="perfil-coluna">
            <section className="cartao apoio-card" aria-label="Minhas conquistas">
              <span className="apoio-card__rotulo">Minhas conquistas</span>

              {progresso.carregando && !progresso.dados && (
                <Esqueleto linhas={2} />
              )}

              {!progresso.carregando && conquistadas.length === 0 && (
                <div className="conquistas-vazio">
                  <p className="conquistas-vazio__titulo">Nenhuma ainda</p>
                  <p className="conquistas-vazio__texto">
                    Quando você desbloquear sua primeira conquista, ela
                    aparece aqui.
                  </p>
                </div>
              )}

              {conquistadas.length > 0 && (
                <ul
                  className="conquistas-grid"
                  style={{ listStyle: 'none', margin: 0, padding: 0 }}
                >
                  {conquistadas.map((badge) => (
                    <li key={badge.id} className="selo-conquista">
                      <span className="selo-conquista__emblema selo-conquista__emblema--verde">
                        <Emblema id={badge.id} />
                      </span>
                      <h3 className="selo-conquista__nome">{badge.nome}</h3>
                      <p className="selo-conquista__texto">
                        {DESCRICOES[badge.id] ?? 'Conquista desbloqueada.'}
                      </p>
                      <span className="selo-conquista__data">Desbloqueada</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
