import { Botao } from './Botao';

interface EstadoVazioProps {
  onCriar: () => void;
}

/**
 * Estado vazio intencional: curto, com um convite claro para a ação seguinte.
 */
export function EstadoVazio({ onCriar }: EstadoVazioProps) {
  return (
    <div className="estado-vazio">
      <span className="estado-vazio__marca" aria-hidden="true">
        <i />
      </span>
      <h2>Sua lista está limpa.</h2>
      <p>
        Crie sua primeira tarefa para começar a organizar seu ritmo — com
        prazo e prioridade, tudo entra no lugar.
      </p>
      <Botao onClick={onCriar}>Nova tarefa</Botao>
    </div>
  );
}
