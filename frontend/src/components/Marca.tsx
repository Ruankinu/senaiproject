interface MarcaProps {
  tamanho?: 'pequena' | 'media' | 'grande';
  /** true = lockup horizontal real (símbolo + wordmark); false = só símbolo. */
  comPalavra?: boolean;
  /** Usa o lockup quadrado completo do asset oficial. */
  lockup?: boolean;
  className?: string;
}

/**
 * Marca oficial do RITHMO — asset real fornecido pelo usuário, convertido
 * para PNG com melhoria de qualidade (Lanczos3). Nunca redesenhamos o
 * símbolo: todos os usos apontam para recortes do arquivo original.
 *
 * - lockup: imagem quadrada completa (símbolo + wordmark empilhados)
 * - comPalavra: lockup horizontal real (símbolo + wordmark lado a lado)
 * - !comPalavra: somente o símbolo oficial
 */
export function Marca({
  tamanho = 'media',
  comPalavra = true,
  lockup = false,
  className = '',
}: MarcaProps) {
  const classeHorizontal = !lockup && comPalavra;
  return (
    <span
      className={`marca-marca marca-marca--${tamanho}${
        lockup ? ' marca-marca--lockup' : classeHorizontal ? ' marca-marca--horizontal' : ''
      } ${className}`}
    >
      <img
        className="marca-marca__imagem"
        src={
          lockup
            ? '/rithmo-logo.png'
            : comPalavra
              ? '/rithmo-horizontal.png'
              : '/rithmo-simbolo-quadrado.png'
        }
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </span>
  );
}
