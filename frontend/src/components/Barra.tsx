interface BarraProps {
  valor: number;
  rotulo: string;
  className?: string;
}

/**
 * Trilho de progresso acessível (role=progressbar) — usado em todos os
 * contextos: home do paciente, lista de pacientes e histórico de 7 dias.
 */
export function Barra({ valor, rotulo, className = '' }: BarraProps) {
  const limitado = Math.max(0, Math.min(100, valor));
  return (
    <span
      className={`barra ${className}`}
      role="progressbar"
      aria-valuenow={limitado}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo}
    >
      <span
        className="barra__preenchimento"
        style={{ width: `${limitado}%` }}
      />
    </span>
  );
}
