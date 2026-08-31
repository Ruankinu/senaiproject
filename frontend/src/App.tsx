import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Marca } from './components/Marca';
import { PaginaLogin } from './pages/PaginaLogin';
import { PaginaRegistro } from './pages/PaginaRegistro';
import { PaginaInicio } from './pages/PaginaInicio';
import { PaginaPerfil } from './pages/PaginaPerfil';
import { PaginaPsicologo } from './pages/PaginaPsicologo';
import { PaginaPaciente } from './pages/PaginaPaciente';
import type { Perfil } from './types';

function TelaCarregando() {
  return (
    <main className="tela-carregando">
      <span className="tela-carregando__pulso">
        <Marca tamanho="media" />
      </span>
    </main>
  );
}

function Protegida({
  perfil,
  children,
}: {
  perfil: Perfil;
  children: React.ReactNode;
}) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <TelaCarregando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.perfil !== perfil) {
    return (
      <Navigate
        to={usuario.perfil === 'psicologo' ? '/psicologo' : '/'}
        replace
      />
    );
  }
  return <>{children}</>;
}

/** Rota do perfil: disponível para paciente e psicólogo. */
function ProtegidaLogada({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <TelaCarregando />;
  if (!usuario) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Publica({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <TelaCarregando />;
  if (usuario) {
    return (
      <Navigate
        to={usuario.perfil === 'psicologo' ? '/psicologo' : '/'}
        replace
      />
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <Publica>
                  <PaginaLogin />
                </Publica>
              }
            />
            <Route
              path="/registro"
              element={
                <Publica>
                  <PaginaRegistro />
                </Publica>
              }
            />
            <Route
              path="/"
              element={
                <Protegida perfil="paciente">
                  <PaginaInicio />
                </Protegida>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtegidaLogada>
                  <PaginaPerfil />
                </ProtegidaLogada>
              }
            />
            <Route
              path="/psicologo"
              element={
                <Protegida perfil="psicologo">
                  <PaginaPsicologo />
                </Protegida>
              }
            />
            <Route
              path="/psicologo/paciente/:id"
              element={
                <Protegida perfil="psicologo">
                  <PaginaPaciente />
                </Protegida>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
