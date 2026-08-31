import {
    buscarOnde,
    buscarPorId,
    inserir,
    atualizarOnde,
    removerOnde
} from '../db/jsonStore.js';
import { ApiError } from '../utils/ApiError.js';

const PRIORIDADES = ['Baixa', 'Média', 'Alta'];
const COMPLEXIDADES = ['Fácil', 'Moderada', 'Intensa'];

function validarDados(dados, { parcial = false } = {}) {
    const resultado = {};

    if (!parcial || dados.titulo !== undefined) {
        if (!dados.titulo?.trim()) {
            throw new ApiError(400, 'Informe o título da atividade.');
        }
        if (String(dados.titulo).length > 200) {
            throw new ApiError(400, 'O título deve ter no máximo 200 caracteres.');
        }
        resultado.titulo = String(dados.titulo).trim();
    }

    if (!parcial || dados.prazo !== undefined) {
        if (!dados.prazo || !/^\d{4}-\d{2}-\d{2}$/.test(String(dados.prazo))) {
            throw new ApiError(400, 'Informe um prazo válido.');
        }
        resultado.prazo = String(dados.prazo);
    }

    if (dados.descricao !== undefined) {
        resultado.descricao = String(dados.descricao).trim() || null;
    }

    if (dados.horario !== undefined) {
        if (dados.horario === '' || dados.horario === null) {
            resultado.horario = null;
        } else if (!/^\d{2}:\d{2}$/.test(String(dados.horario))) {
            throw new ApiError(400, 'Horário inválido. Use HH:MM.');
        } else {
            resultado.horario = String(dados.horario);
        }
    }

    if (!parcial || dados.prioridade !== undefined) {
        const prioridade = dados.prioridade ?? 'Média';
        if (!PRIORIDADES.includes(prioridade)) {
            throw new ApiError(400, 'Prioridade inválida.');
        }
        resultado.prioridade = prioridade;
    }

    if (!parcial || dados.complexidade !== undefined) {
        const complexidade = dados.complexidade ?? 'Moderada';
        if (!COMPLEXIDADES.includes(complexidade)) {
            throw new ApiError(400, 'Complexidade inválida.');
        }
        resultado.complexidade = complexidade;
    }

    if (dados.status !== undefined) {
        if (!['Pendente', 'Concluída'].includes(dados.status)) {
            throw new ApiError(400, 'Status inválido.');
        }
        resultado.status = dados.status;
    }

    return resultado;
}

/** Formata o registro interno para o contrato da API. */
function montarObjeto(linha) {
    return {
        id: linha.id,
        titulo: linha.titulo,
        descricao: linha.descricao ?? null,
        prazo: linha.prazo,
        horario: linha.horario ? String(linha.horario).slice(0, 5) : null,
        prioridade: linha.prioridade,
        complexidade: linha.complexidade,
        status: linha.status,
        criadoEm: linha.criadoEm,
        concluidaEm: linha.concluidaEm ?? null
    };
}

function ordenarPorHorario(atividades) {
    return atividades.sort((a, b) => {
        const ha = a.horario ?? '99:99';
        const hb = b.horario ?? '99:99';
        if (ha !== hb) return ha.localeCompare(hb);
        return (a.id ?? 0) - (b.id ?? 0);
    });
}

export function listarAtividades(usuarioId, { status, data } = {}) {
    let atividades = buscarOnde(
        'atividades',
        (a) => a.usuarioId === Number(usuarioId)
    );

    if (status) atividades = atividades.filter((a) => a.status === status);
    if (data) atividades = atividades.filter((a) => a.prazo === data);

    return ordenarPorHorario(atividades).map(montarObjeto);
}

export async function criarAtividade(usuarioId, dados) {
    const validos = validarDados(dados);

    const linha = await inserir('atividades', {
        usuarioId: Number(usuarioId),
        titulo: validos.titulo,
        descricao: validos.descricao ?? null,
        prazo: validos.prazo,
        horario: validos.horario ?? null,
        prioridade: validos.prioridade,
        complexidade: validos.complexidade,
        status: 'Pendente',
        concluidaEm: null,
        criadoEm: new Date().toISOString()
    });

    return montarObjeto(linha);
}

export function buscarAtividade(usuarioId, id) {
    const linha = buscarPorId('atividades', Number(id));

    if (!linha || linha.usuarioId !== Number(usuarioId)) {
        throw new ApiError(404, 'Atividade não encontrada.');
    }

    return montarObjeto(linha);
}

export async function atualizarAtividade(usuarioId, id, dados) {
    buscarAtividade(usuarioId, id);

    const validos = validarDados(dados, { parcial: true });
    if (Object.keys(validos).length === 0) {
        throw new ApiError(400, 'Nenhum dado foi enviado para atualização.');
    }

    const linha = await atualizarOnde(
        'atividades',
        (a) => a.id === Number(id) && a.usuarioId === Number(usuarioId),
        validos
    );

    return montarObjeto(linha);
}

export async function excluirAtividade(usuarioId, id) {
    buscarAtividade(usuarioId, id);
    await removerOnde(
        'atividades',
        (a) => a.id === Number(id) && a.usuarioId === Number(usuarioId)
    );
}

export async function alternarConclusao(usuarioId, id) {
    const atividade = buscarAtividade(usuarioId, id);

    const concluindo = atividade.status !== 'Concluída';

    const linha = await atualizarOnde(
        'atividades',
        (a) => a.id === Number(id) && a.usuarioId === Number(usuarioId),
        {
            status: concluindo ? 'Concluída' : 'Pendente',
            concluidaEm: concluindo ? new Date().toISOString() : null
        }
    );

    return montarObjeto(linha);
}

/** Rotina de um dia: atividades ordenadas por horário + progresso. */
export function rotinaDoDia(usuarioId, data) {
    const atividades = listarAtividades(usuarioId, { data });
    const total = atividades.length;
    const concluidas = atividades.filter(
        (atividade) => atividade.status === 'Concluída'
    ).length;

    return {
        data,
        total,
        concluidas,
        progresso: total === 0 ? 0 : Math.round((concluidas / total) * 100),
        atividades
    };
}
