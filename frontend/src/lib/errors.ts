import { ApiError } from './api';

/**
 * Converte erros técnicos da API em mensagens úteis para o usuário.
 * Detalhes técnicos permanecem no console para depuração.
 */
export function mensagemErro(erro: unknown, contexto: string): string {
  if (erro instanceof ApiError) {
    const { status, message } = erro;

    if (status === 400) {
      return message || 'Alguns dados estão inválidos. Verifique os campos.';
    }

    if (status === 401) {
      return 'Sua sessão expirou. Entre novamente.';
    }

    if (status === 403) {
      return 'Você não tem acesso a esta área.';
    }

    if (status === 404) {
      return 'Não encontramos o que você procurava.';
    }

    if (status === 500) {
      return 'Não foi possível concluir a operação. Tente novamente em instantes.';
    }

    if (status === 0) {
      return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
    }

    return message || `${contexto}: algo deu errado. Tente novamente.`;
  }

  console.error(`[erro] ${contexto}:`, erro);
  return `${contexto}: algo inesperado aconteceu. Tente novamente.`;
}
