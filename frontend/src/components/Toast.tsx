import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icone } from './Icone';

type Tom = 'sucesso' | 'erro' | 'conquista';

interface Toast {
  id: number;
  mensagem: string;
  tom: Tom;
}

interface ContextoToast {
  mostrar: (mensagem: string, tom?: Tom) => void;
}

const Contexto = createContext<ContextoToast | null>(null);

export function useToast(): ContextoToast {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return contexto;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const proximoId = useRef(1);

  const mostrar = useCallback((mensagem: string, tom: Tom = 'sucesso') => {
    const id = proximoId.current++;
    setToasts((atual) => [...atual, { id, mensagem, tom }]);
    window.setTimeout(() => {
      setToasts((atual) => atual.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        className="toasts"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tom}`}>
            {toast.tom === 'erro' ? (
              <Icone nome="x" tamanho={14} />
            ) : toast.tom === 'conquista' ? (
              <Icone nome="trophy" tamanho={14} />
            ) : (
              <Icone nome="check" tamanho={14} />
            )}
            {toast.mensagem}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}
