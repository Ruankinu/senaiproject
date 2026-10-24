import {
    registrar,
    login,
    obterPerfil,
    atualizarFoto,
    atualizarPerfil,
    alterarSenha
} from '../services/authService.js';
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

// NOVO — atualizar (ou remover, enviando fotoUrl: null) a foto de perfil.
export const atualizarFotoController = tratar(async (req, res) => {
    const { fotoUrl } = req.body;
    const usuario = await atualizarFoto(req.usuario.id, fotoUrl ?? null);
    return res.status(200).json({ usuario });
});

// NOVO — atualizar nome e/ou e-mail da própria conta.
export const atualizarPerfilController = tratar(async (req, res) => {
    const { nome, email } = req.body;
    const usuario = await atualizarPerfil(req.usuario.id, { nome, email });
    return res.status(200).json({ usuario });
});

// NOVO — trocar a senha (exige a senha atual).
export const alterarSenhaController = tratar(async (req, res) => {
    const { senhaAtual, novaSenha } = req.body;
    await alterarSenha(req.usuario.id, { senhaAtual, novaSenha });
    return res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
});