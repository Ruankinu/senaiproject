import jwt from 'jsonwebtoken';
import { buscarPorId } from '../db/jsonStore.js';

const SEGREDO = process.env.JWT_SECRET || 'rithmo-dev-secret';

/** Gera token de sessão (7 dias) para o usuário autenticado. */
export function assinarToken(usuario) {
    return jwt.sign(
        { sub: usuario.id, perfil: usuario.perfil },
        SEGREDO,
        { expiresIn: '7d' }
    );
}

/**
 * Middleware de autenticação: valida o Bearer token e anexa o usuário
 * real (buscado na persistência JSON) em `req.usuario`.
 */
export async function requireAuth(req, res, next) {
    try {
        const cabecalho = req.headers.authorization || '';
        const token = cabecalho.startsWith('Bearer ')
            ? cabecalho.slice(7)
            : null;

        if (!token) {
            return res.status(401).json({ mensagem: 'Autenticação necessária.' });
        }

        const payload = jwt.verify(token, SEGREDO);

        const usuario = buscarPorId('usuarios', Number(payload.sub));

        if (!usuario) {
            return res.status(401).json({ mensagem: 'Sessão inválida.' });
        }

        req.usuario = usuario;
        return next();
    } catch (erro) {
        if (
            erro.name === 'JsonWebTokenError' ||
            erro.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({
                mensagem: 'Sessão expirada. Entre novamente.'
            });
        }

        console.error('[auth] Erro na autenticação:', erro);
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
}

/** Restringe uma rota a perfis específicos (paciente / psicólogo). */
export function exigirPerfil(...perfis) {
    return (req, res, next) => {
        if (!perfis.includes(req.usuario.perfil)) {
            return res.status(403).json({
                mensagem: 'Acesso restrito a este perfil.'
            });
        }
        return next();
    };
}
