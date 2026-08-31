import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
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

const CAMPOS_USUARIO = 'id, nome, email, perfil, criado_em';

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

    const [existentes] = await db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [emailNormalizado]
    );
    if (existentes.length > 0) {
        throw new ApiError(409, 'Este e-mail já está cadastrado.');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [resultado] = await db.query(
        'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
        [nome.trim(), emailNormalizado, senhaHash, perfil]
    );

    // Fallback: alguns drivers de preview não retornam insertId.
    let id = resultado.insertId;
    if (!id) {
        const [linhas] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailNormalizado]
        );
        id = linhas[0]?.id;
    }
    if (!id) throw new ApiError(500, 'Não foi possível criar a conta.');

    if (perfil === 'psicologo') {
        // Código único de vínculo (6 caracteres, sem ambiguidade visual).
        let codigo = '';
        for (let tentativa = 0; tentativa < 10; tentativa += 1) {
            codigo = gerarCodigo();
            const [ocupado] = await db.query(
                'SELECT 1 FROM psicologos WHERE codigo = ?',
                [codigo]
            );
            if (ocupado.length === 0) break;
        }
        await db.query(
            'INSERT INTO psicologos (usuario_id, codigo) VALUES (?, ?)',
            [id, codigo]
        );
    }

    const usuario = { id, nome: nome.trim(), email: emailNormalizado, perfil };

    return { token: assinarToken(usuario), usuario };
}

export async function login({ email, senha }) {
    if (!email?.trim() || !senha) {
        throw new ApiError(400, 'Informe e-mail e senha.');
    }

    const [linhas] = await db.query(
        'SELECT id, nome, email, perfil, senha_hash FROM usuarios WHERE email = ?',
        [email.trim().toLowerCase()]
    );

    if (linhas.length === 0) {
        throw new ApiError(401, 'E-mail ou senha incorretos.');
    }

    const usuario = linhas[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
        throw new ApiError(401, 'E-mail ou senha incorretos.');
    }

    return {
        token: assinarToken(usuario),
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }
    };
}

/** Dados do usuário autenticado + infos do perfil (código/vínculo). */
export async function obterPerfil(usuarioId) {
    const [linhas] = await db.query(
        `SELECT ${CAMPOS_USUARIO} FROM usuarios WHERE id = ?`,
        [usuarioId]
    );

    if (linhas.length === 0) throw new ApiError(404, 'Usuário não encontrado.');

    const usuario = linhas[0];

    if (usuario.perfil === 'psicologo') {
        const [psicologo] = await db.query(
            'SELECT codigo FROM psicologos WHERE usuario_id = ?',
            [usuarioId]
        );
        const [pacientes] = await db.query(
            'SELECT COUNT(*) AS total FROM vinculos WHERE psicologo_id = ?',
            [usuarioId]
        );
        return {
            ...usuario,
            codigo: psicologo[0]?.codigo ?? null,
            pacientesVinculados: pacientes[0].total
        };
    }

    const [vinculos] = await db.query(
        `SELECT u.id, u.nome, u.email
         FROM vinculos v
         JOIN usuarios u ON u.id = v.psicologo_id
         WHERE v.paciente_id = ?
         ORDER BY v.criado_em DESC
         LIMIT 1`,
        [usuarioId]
    );

    return {
        ...usuario,
        psicologoVinculado: vinculos[0] ?? null
    };
}
