import bcrypt from 'bcryptjs';
import {
    buscarOnde,
    buscarPorId,
    inserir,
    contarOnde
} from '../db/jsonStore.js';
import { ApiError } from '../utils/ApiError.js';
import { assinarToken } from '../middleware/auth.js';

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
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    };
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

    const { senhaHash, ...publico } = usuario;

    if (publico.perfil === 'psicologo') {
        const [psicologo] = buscarOnde(
            'psicologos',
            (p) => p.usuarioId === publico.id
        );
        return {
            ...publico,
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
            ? { id: psicologo.id, nome: psicologo.nome, email: psicologo.email }
            : null
    };
}
