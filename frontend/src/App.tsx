import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PaginaLogin } from './pages/PaginaLogin';
import { PaginaRegistro } from './pages/PaginaRegistro';
import { PaginaInicio } from './pages/PaginaInicio';
import { PaginaPsicologo } from './pages/PaginaPsicologo';
import { PaginaPaciente } from './pages/PaginaPaciente';
import { PaginaPerfil } from './pages/PaginaPerfil.tsx'; // NOVO
import type { Perfil } from './types';

function TelaCarregando() {
  return (
    <main className="auth">
      <div className="tela-carregando" aria-hidden="true">
        <span className="tela-carregando__pulso" />
      </div>
    </main>
  );
}

function Protegida({
  perfil,
  children,
}: {
  // NOVO — perfil agora é opcional: sem ele, a rota só exige estar logado
  // (usada pela página de Perfil, acessível a paciente ou psicólogo).
  perfil?: Perfil;
  children: React.ReactNode;
}) {
  const { usuario, carregando } = useAuth();

  if (carregando) return <TelaCarregando />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (perfil && usuario.perfil !== perfil) {
    return (
      <Navigate
        to={usuario.perfil === 'psicologo' ? '/psicologo' : '/'}
        replace
      />
    );
  }
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
            {/* NOVO — perfil da própria conta, sem perfil= porque vale pros dois tipos */}
            <Route
              path="/perfil"
              element={
                <Protegida>
                  <PaginaPerfil />
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