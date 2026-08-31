import { ApiError } from './ApiError.js';

/**
 * Envolve handlers assíncronos: converte ApiError em resposta HTTP
 * previsível e erros inesperados em 500 (detalhes no console).
 */
export function tratar(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (erro) {
            if (erro instanceof ApiError) {
                return res.status(erro.status).json({ mensagem: erro.message });
            }

            console.error('[api] Erro inesperado:', erro);
            return res.status(500).json({
                mensagem: 'Erro interno do servidor.'
            });
        }
    };
}
