/**
 * Placeholders estruturais: preservam o layout enquanto os dados carregam.
 */
export function Esqueleto({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="lista-esqueleto" aria-hidden="true">
      {Array.from({ length: linhas }).map((_, indice) => (
        <div key={indice} className="esqueleto">
          <span className="esqueleto__check" />
          <span className="esqueleto__horario" />
          <div className="esqueleto__corpo">
            <span className="esqueleto__linha esqueleto__linha--titulo" />
            <span className="esqueleto__linha esqueleto__linha--desc" />
          </div>
          <span className="esqueleto__linha esqueleto__linha--meta" />
          <span className="esqueleto__linha esqueleto__linha--meta curta" />
        </div>
      ))}
    </div>
  );
}

export function EsqueletoPainel({ alto = true }: { alto?: boolean }) {
  return (
    <div className={`esqueleto-painel${alto ? ' esqueleto-painel--alto' : ''}`} aria-hidden="true">
      <span className="esqueleto__linha esqueleto__linha--titulo" />
      <span className="esqueleto__linha" />
      <span className="esqueleto__linha" />
    </div>
  );
}
