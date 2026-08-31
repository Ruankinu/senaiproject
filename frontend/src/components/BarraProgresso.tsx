interface BarraProgressoProps {
  /** 0 a 100 */
  valor: number;
  rotulo?: string;
}

export function BarraProgresso({ valor, rotulo }: BarraProgressoProps) {
  const limitado = Math.max(0, Math.min(100, valor));
  return (
    <div
      className="barra-progresso"
      role="progressbar"
      aria-valuenow={limitado}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={rotulo ?? 'Progresso'}
    >
      <span style={{ width: `${limitado}%` }} />
    </div>
  );
}
