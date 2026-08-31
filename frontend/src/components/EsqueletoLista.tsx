/**
 * Placeholder estrutural da lista: preserva o layout enquanto os dados
 * carregam, evitando saltos visuais.
 */
export function EsqueletoLista() {
  return (
    <div className="lista-esqueleto" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, indice) => (
        <div key={indice} className="esqueleto">
          <span className="esqueleto__check" />
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
