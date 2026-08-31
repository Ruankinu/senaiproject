import { Botao } from './Botao';
import { Marca } from './Marca';

interface EstadoVazioProps {
  titulo: string;
  texto: string;
  acao?: { rotulo: string; onClick: () => void };
}

/** Estado vazio intencional: curto, com um convite claro para a ação. */
export function EstadoVazio({ titulo, texto, acao }: EstadoVazioProps) {
  return (
    <div className="estado-vazio">
      <Marca comPalavra={false} tamanho="grande" className="estado-vazio__marca" />
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {acao && <Botao onClick={acao.onClick}>{acao.rotulo}</Botao>}
    </div>
  );
}
