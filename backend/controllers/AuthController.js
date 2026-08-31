import { registrar, login, obterPerfil } from '../services/authService.js';
import { tratar } from '../utils/tratar.js';

export const registrarController = tratar(async (req, res) => {
    const { nome, email, senha, perfil } = req.body;
    const resultado = await registrar({ nome, email, senha, perfil });
    return res.status(201).json(resultado);
});

export const loginController = tratar(async (req, res) => {
    const { email, senha } = req.body;
    const resultado = await login({ email, senha });
    return res.status(200).json(resultado);
});

export const perfilController = tratar(async (req, res) => {
    const perfil = await obterPerfil(req.usuario.id);
    return res.status(200).json({ usuario: perfil });
});
