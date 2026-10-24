import type { Complexidade } from '../types';

const NIVEL: Record<Complexidade, number> = {
  Fácil: 1,
  Moderada: 2,
  Intensa: 3,
};

interface MedidorComplexidadeProps {
  nivel: Complexidade | string;
  comRotulo?: boolean;
}

/**
 * Medidor de complexidade em 3 barras crescentes. Cada barra tem a cor do
 * seu ponto na escala verde → âmbar → vermelho (a mesma escala mostrada no
 * seletor do formulário), então a barra acesa sempre bate com o gradiente.
 */
export function MedidorComplexidade({
  nivel,
  comRotulo = false,
}: MedidorComplexidadeProps) {
  const quantidade = NIVEL[nivel as Complexidade] ?? 1;

  return (
    <span
      className="medidor"
      role="img"
      aria-label={`Complexidade ${nivel}`}
      title={`Complexidade ${nivel}`}
    >
      {[1, 2, 3].map((posicao) => (
        <i
          key={posicao}
          className={`medidor__barra medidor__barra--${posicao}${
            posicao <= quantidade ? ' is-on' : ''
          }`}
          aria-hidden="true"
        />
      ))}
      {comRotulo && <span className="medidor__rotulo">{nivel}</span>}
    </span>
  );
}
