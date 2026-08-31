import { db } from '../db/database.js';
import { ApiError } from '../utils/ApiError.js';
import { obterResumoPaciente } from './gamificacaoService.js';

/** Código de vínculo do psicólogo (para compartilhar com pacientes). */
export async function obterCodigo(psicologoId) {
    const [linhas] = await db.query(
        'SELECT codigo FROM psicologos WHERE usuario_id = ?',
        [psicologoId]
    );
    return linhas[0]?.codigo ?? null;
}

/** Vínculo do paciente com seu psicólogo (ou null). */
export async function obterVinculo(pacienteId) {
    const [linhas] = await db.query(
        `SELECT u.id, u.nome, u.email
         FROM vinculos v
         JOIN usuarios u ON u.id = v.psicologo_id
         WHERE v.paciente_id = ?
         ORDER BY v.criado_em DESC
         LIMIT 1`,
        [pacienteId]
    );
    return linhas[0] ?? null;
}

/** Paciente informa o código do psicólogo e cria o vínculo real. */
export async function vincularPorCodigo(pacienteId, codigo) {
    if (!codigo?.trim()) {
        throw new ApiError(400, 'Informe o código do psicólogo.');
    }

    const codigoNormalizado = String(codigo).trim().toUpperCase();

    const [psicologos] = await db.query(
        `SELECT u.id, u.nome, u.email
         FROM psicologos p
         JOIN usuarios u ON u.id = p.usuario_id
         WHERE p.codigo = ?`,
        [codigoNormalizado]
    );

    if (psicologos.length === 0) {
        throw new ApiError(404, 'Código inválido. Confira com seu psicólogo.');
    }

    const psicologo = psicologos[0];

    const [existentes] = await db.query(
        'SELECT 1 FROM vinculos WHERE paciente_id = ? AND psicologo_id = ?',
        [pacienteId, psicologo.id]
    );

    if (existentes.length === 0) {
        await db.query(
            'INSERT INTO vinculos (paciente_id, psicologo_id) VALUES (?, ?)',
            [pacienteId, psicologo.id]
        );
    }

    return psicologo;
}

/** Lista de pacientes do psicólogo com resumo real da rotina. */
export async function listarPacientes(psicologoId) {
    const [pacientes] = await db.query(
        `SELECT u.id, u.nome, u.email, v.criado_em AS vinculado_em
         FROM vinculos v
         JOIN usuarios u ON u.id = v.paciente_id
         WHERE v.psicologo_id = ?
         ORDER BY u.nome ASC`,
        [psicologoId]
    );

    const resultado = [];
    for (const paciente of pacientes) {
        const resumo = await obterResumoPaciente(paciente.id);
        resultado.push({
            id: paciente.id,
            nome: paciente.nome,
            email: paciente.email,
            vinculadoEm: paciente.vinculado_em,
            hoje: resumo.hoje,
            atrasadas: resumo.atrasadas,
            streak: resumo.progresso.streak
        });
    }

    return resultado;
}

/** Garante que o psicólogo tem vínculo com o paciente informado. */
export async function validarAcessoPaciente(psicologoId, pacienteId) {
    const [linhas] = await db.query(
        'SELECT 1 FROM vinculos WHERE psicologo_id = ? AND paciente_id = ?',
        [psicologoId, pacienteId]
    );

    if (linhas.length === 0) {
        throw new ApiError(404, 'Paciente não encontrado.');
    }
}
