import bcrypt from 'bcryptjs';
import {
    buscarOnde,
    buscarPorId,
    inserir,
    atualizarOnde,
    contarOnde
} from '../db/jsonStore.js';
import { ApiError } from '../utils/ApiError.js';
import { assinarToken } from '../middleware/auth.js';
import { metaDocumento } from './documentoService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERFIS = ['paciente', 'psicologo'];

function gerarCodigo() {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codigo = '';
    for (let i = 0; i < 6; i += 1) {
        codigo += alfabeto[Math.floor(Math.random() * alfabeto.length)];
    }
    return codigo;
}

function usuarioPublico(usuario) {
    const publico = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    };
    if (usuario.perfil === 'psicologo') {
        const [psicologo] = buscarOnde(
            'psicologos',
            (p) => p.usuarioId === usuario.id
        );
        publico.codigo = psicologo?.codigo ?? null;
    }
    return publico;
}

export async function registrar({ nome, email, senha, perfil }) {
    if (!nome?.trim()) throw new ApiError(400, 'Informe seu nome.');
    if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
        throw new ApiError(400, 'Informe um e-mail válido.');
    }
    if (!senha || senha.length < 6) {
        throw new ApiError(400, 'A senha precisa ter ao menos 6 caracteres.');
    }
    if (!PERFIS.includes(perfil)) {
        throw new ApiError(400, 'Escolha o perfil Paciente ou Psicólogo.');
    }

    const emailNormalizado = email.trim().toLowerCase();

    const existentes = buscarOnde(
        'usuarios',
        (u) => u.email === emailNormalizado
    );
    if (existentes.length > 0) {
        throw new ApiError(409, 'Este e-mail já está cadastrado.');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await inserir('usuarios', {
        nome: nome.trim(),
        email: emailNormalizado,
        senhaHash,
        perfil,
        criadoEm: new Date().toISOString()
    });

    if (perfil === 'psicologo') {
        // Código único de vínculo (6 caracteres, sem ambiguidade visual).
        let codigo = '';
        for (let tentativa = 0; tentativa < 10; tentativa += 1) {
            codigo = gerarCodigo();
            const ocupado = buscarOnde(
                'psicologos',
                (p) => p.codigo === codigo
            );
            if (ocupado.length === 0) break;
        }
        await inserir('psicologos', { usuarioId: usuario.id, codigo });
    }

    return { token: assinarToken(usuario), usuario: usuarioPublico(usuario) };
}

export async function login({ email, senha }) {
    if (!email?.trim() || !senha) {
        throw new ApiError(400, 'Informe e-mail e senha.');
    }

    const [usuario] = buscarOnde(
        'usuarios',
        (u) => u.email === email.trim().toLowerCase()
    );

    if (!usuario) {
        throw new ApiError(401, 'E-mail ou senha incorretos.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
        throw new ApiError(401, 'E-mail ou senha incorretos.');
    }

    return { token: assinarToken(usuario), usuario: usuarioPublico(usuario) };
}

/** Dados do usuário autenticado + infos do perfil (código/vínculo). */
export async function obterPerfil(usuarioId) {
    const usuario = buscarPorId('usuarios', Number(usuarioId));

    if (!usuario) throw new ApiError(404, 'Usuário não encontrado.');

    // documento: nunca expõe o nome do arquivo no disco — só os metadados.
    const { senhaHash, documento, ...publico } = usuario;

    if (publico.perfil === 'psicologo') {
        const [psicologo] = buscarOnde(
            'psicologos',
            (p) => p.usuarioId === publico.id
        );
        return {
            ...publico,
            documento: metaDocumento(documento),
            codigo: psicologo?.codigo ?? null,
            pacientesVinculados: contarOnde(
                'vinculos',
                (v) => v.psicologoId === publico.id
            )
        };
    }

    const vinculos = buscarOnde(
        'vinculos',
        (v) => v.pacienteId === publico.id
    ).sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)));

    const psicologo = vinculos[0]
        ? buscarPorId('usuarios', vinculos[0].psicologoId)
        : null;

    return {
        ...publico,
        psicologoVinculado: psicologo
            ? {
                  id: psicologo.id,
                  nome: psicologo.nome,
                  email: psicologo.email,
                  fotoUrl: psicologo.fotoUrl ?? null // NOVO
              }
            : null
    };
}

/**
 * NOVO — Atualiza nome e/ou e-mail da própria conta. Cada campo é
 * opcional: manda só o que mudou. O e-mail não pode ficar igual ao de
 * outra conta já existente.
 */
export async function atualizarPerfil(usuarioId, { nome, email } = {}) {
    const mudancas = {};

    if (nome !== undefined) {
        if (!nome?.trim()) throw new ApiError(400, 'Informe seu nome.');
        mudancas.nome = nome.trim();
    }

    if (email !== undefined) {
        if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
            throw new ApiError(400, 'Informe um e-mail válido.');
        }
        const emailNormalizado = email.trim().toLowerCase();
        const emUsoPorOutro = buscarOnde(
            'usuarios',
            (u) => u.email === emailNormalizado && u.id !== usuarioId
        );
        if (emUsoPorOutro.length > 0) {
            throw new ApiError(409, 'Este e-mail já está sendo usado por outra conta.');
        }
        mudancas.email = emailNormalizado;
    }

    if (Object.keys(mudancas).length === 0) {
        throw new ApiError(400, 'Nada para atualizar.');
    }

    const atualizado = await atualizarOnde(
        'usuarios',
        (u) => u.id === usuarioId,
        mudancas
    );
    if (!atualizado) throw new ApiError(404, 'Usuário não encontrado.');

    return obterPerfil(usuarioId);
}

/**
 * NOVO — Troca a senha da própria conta. Exige a senha atual (conferida
 * com bcrypt) antes de aceitar a nova.
 */
export async function alterarSenha(usuarioId, { senhaAtual, novaSenha } = {}) {
    if (!senhaAtual) throw new ApiError(400, 'Informe sua senha atual.');
    if (!novaSenha || novaSenha.length < 6) {
        throw new ApiError(400, 'A nova senha precisa ter ao menos 6 caracteres.');
    }

    const usuario = buscarPorId('usuarios', usuarioId);
    if (!usuario) throw new ApiError(404, 'Usuário não encontrado.');

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!senhaValida) throw new ApiError(401, 'Senha atual incorreta.');

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await atualizarOnde(
        'usuarios',
        (u) => u.id === usuarioId,
        { senhaHash: novaSenhaHash }
    );
}

/**
 * NOVO — Salva (ou remove, se fotoUrl for null) a foto de perfil do
 * usuário autenticado. A imagem chega como data URL (base64) já
 * redimensionada/comprimida no front; aqui só validamos o formato e um
 * teto de tamanho — o corpo da requisição já tem limite no server.js.
 */
export async function atualizarFoto(usuarioId, fotoUrl) {
    if (fotoUrl !== null) {
        if (typeof fotoUrl !== 'string' || !fotoUrl.startsWith('data:image/')) {
            throw new ApiError(400, 'Foto inválida.');
        }
        if (fotoUrl.length > 1_500_000) {
            throw new ApiError(400, 'A foto ficou grande demais. Tente uma imagem menor.');
        }
    }

    const atualizado = await atualizarOnde(
        'usuarios',
        (u) => u.id === usuarioId,
        { fotoUrl }
    );
    if (!atualizado) throw new ApiError(404, 'Usuário não encontrado.');

    return obterPerfil(usuarioId);
}