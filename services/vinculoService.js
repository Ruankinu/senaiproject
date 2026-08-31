import {
    buscarOnde,
    buscarPorId,
    inserir
} from '../db/jsonStore.js';
import { ApiError } from '../utils/ApiError.js';
import { obterResumoPaciente } from './gamificacaoService.js';

function dadosPsicologo(psicologoId) {
    const psicologo = buscarPorId('usuarios', Number(psicologoId));
    return psicologo
        ? { id: psicologo.id, nome: psicologo.nome, email: psicologo.email }
        : null;
}

/** Código de vínculo do psicólogo (para compartilhar com pacientes). */
export function obterCodigo(psicologoId) {
    const [psicologo] = buscarOnde(
        'psicologos',
        (p) => p.usuarioId === Number(psicologoId)
    );
    return psicologo?.codigo ?? null;
}

/** Vínculo do paciente com seu psicólogo (ou null). */
export function obterVinculo(pacienteId) {
    const vinculos = buscarOnde(
        'vinculos',
        (v) => v.pacienteId === Number(pacienteId)
    ).sort((a, b) => String(b.criadoEm).localeCompare(String(a.criadoEm)));

    return vinculos[0] ? dadosPsicologo(vinculos[0].psicologoId) : null;
}

/** Paciente informa o código do psicólogo e cria o vínculo real. */
export async function vincularPorCodigo(pacienteId, codigo) {
    if (!codigo?.trim()) {
        throw new ApiError(400, 'Informe o código do psicólogo.');
    }

    const codigoNormalizado = String(codigo).trim().toUpperCase();

    const [psicologoRegistro] = buscarOnde(
        'psicologos',
        (p) => p.codigo === codigoNormalizado
    );

    if (!psicologoRegistro) {
        throw new ApiError(404, 'Código inválido. Confira com seu psicólogo.');
    }

    const psicologo = dadosPsicologo(psicologoRegistro.usuarioId);
    const existente = buscarOnde(
        'vinculos',
        (v) =>
            v.pacienteId === Number(pacienteId) &&
            v.psicologoId === psicologo.id
    );

    if (existente.length === 0) {
        await inserir('vinculos', {
            pacienteId: Number(pacienteId),
            psicologoId: psicologo.id,
            criadoEm: new Date().toISOString()
        });
    }

    return psicologo;
}

/** Lista de pacientes do psicólogo com resumo real da rotina. */
export async function listarPacientes(psicologoId) {
    const vinculos = buscarOnde(
        'vinculos',
        (v) => v.psicologoId === Number(psicologoId)
    ).sort((a, b) => String(a.criadoEm).localeCompare(String(b.criadoEm)));

    const resultado = [];
    for (const vinculo of vinculos) {
        const paciente = buscarPorId('usuarios', vinculo.pacienteId);
        if (!paciente) continue;
        const resumo = obterResumoPaciente(paciente.id);
        resultado.push({
            id: paciente.id,
            nome: paciente.nome,
            email: paciente.email,
            vinculadoEm: vinculo.criadoEm,
            hoje: resumo.hoje,
            atrasadas: resumo.atrasadas,
            streak: resumo.progresso.streak
        });
    }

    return resultado.sort((a, b) => a.nome.localeCompare(b.nome));
}

/** Garante que o psicólogo tem vínculo com o paciente informado. */
export function validarAcessoPaciente(psicologoId, pacienteId) {
    const vinculo = buscarOnde(
        'vinculos',
        (v) =>
            v.psicologoId === Number(psicologoId) &&
            v.pacienteId === Number(pacienteId)
    );

    if (vinculo.length === 0) {
        throw new ApiError(404, 'Paciente não encontrado.');
    }
}
