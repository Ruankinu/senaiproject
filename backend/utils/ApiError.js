/**
 * Erro de domínio com status HTTP: usado por services para rejeitar
 * entradas inválidas e por controllers para responder de forma previsível.
 */
export class ApiError extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.name = 'ApiError';
        this.status = status;
    }
}
