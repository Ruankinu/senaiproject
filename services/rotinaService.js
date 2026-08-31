import { db } from '../db/database.js';
import { ApiError } from '../utils/ApiError.js';

export const PRIORIDADES = ['Baixa', 'Média', 'Alta'];
export const COMPLEXIDADES = ['Fácil', 'Moderada', 'Intensa'];

const CAMPOS = `id, titulo, descricao, prazo, horario, prioridade, complexidade, status, criado_em`;

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
            resultado.horario = `${String(dados.horario)}:00`;
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

function montarObjeto(linha) {
    return {
        ...linha,
        horario: linha.horario ? String(linha.horario).slice(0, 5) : null,
        criadoEm: linha.criado_em,
        concluidaEm: linha.concluida_em ?? null
    };
}

export async function listarAtividades(usuarioId, { status, data } = {}) {
    const clausulas = ['usuario_id = ?'];
    const parametros = [usuarioId];

    if (status) {
        clausulas.push('status = ?');
        parametros.push(status);
    }
    if (data) {
        clausulas.push('prazo = ?');
        parametros.push(data);
    }

    const [linhas] = await db.query(
        `SELECT ${CAMPOS}, concluida_em
         FROM atividades
         WHERE ${clausulas.join(' AND ')}
         ORDER BY horario IS NULL, horario ASC, id ASC`,
        parametros
    );

    return linhas.map(montarObjeto);
}

export async function criarAtividade(usuarioId, dados) {
    const validos = validarDados(dados);

    const [resultado] = await db.query(
        `INSERT INTO atividades
         (usuario_id, titulo, descricao, prazo, horario, prioridade, complexidade)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            usuarioId,
            validos.titulo,
            validos.descricao ?? null,
            validos.prazo,
            validos.horario ?? null,
            validos.prioridade,
            validos.complexidade
        ]
    );

    // Fallback: alguns drivers de preview não retornam insertId.
    let id = resultado.insertId;
    if (!id) {
        const [linhas] = await db.query(
            'SELECT id FROM atividades WHERE usuario_id = ? ORDER BY id DESC LIMIT 1',
            [usuarioId]
        );
        id = linhas[0]?.id;
    }
    if (!id) throw new ApiError(500, 'Não foi possível criar a atividade.');

    return buscarAtividade(usuarioId, id);
}

export async function buscarAtividade(usuarioId, id) {
    const [linhas] = await db.query(
        `SELECT ${CAMPOS}, concluida_em
         FROM atividades
         WHERE id = ? AND usuario_id = ?`,
        [id, usuarioId]
    );

    if (linhas.length === 0) {
        throw new ApiError(404, 'Atividade não encontrada.');
    }

    return montarObjeto(linhas[0]);
}

export async function atualizarAtividade(usuarioId, id, dados) {
    await buscarAtividade(usuarioId, id);

    const validos = validarDados(dados, { parcial: true });
    if (Object.keys(validos).length === 0) {
        throw new ApiError(400, 'Nenhum dado foi enviado para atualização.');
    }

    const campos = Object.keys(validos).map((campo) => `${campo} = ?`);
    const valores = Object.values(validos);

    await db.query(
        `UPDATE atividades SET ${campos.join(', ')} WHERE id = ? AND usuario_id = ?`,
        [...valores, id, usuarioId]
    );

    return buscarAtividade(usuarioId, id);
}

export async function excluirAtividade(usuarioId, id) {
    // A existência já foi validada; o DELETE não depende de affectedRows
    // (alguns drivers de preview reportam 0 mesmo com sucesso).
    await buscarAtividade(usuarioId, id);
    await db.query(
        'DELETE FROM atividades WHERE id = ? AND usuario_id = ?',
        [id, usuarioId]
    );
}

export async function alternarConclusao(usuarioId, id) {
    // A existência já foi validada; o UPDATE não depende de affectedRows
    // (alguns drivers de preview reportam 0 mesmo com sucesso).
    const atividade = await buscarAtividade(usuarioId, id);

    const concluindo = atividade.status !== 'Concluída';

    await db.query(
        `UPDATE atividades
         SET status = ?, concluida_em = ?
         WHERE id = ? AND usuario_id = ?`,
        [
            concluindo ? 'Concluída' : 'Pendente',
            concluindo ? new Date().toISOString() : null,
            id,
            usuarioId
        ]
    );

    return buscarAtividade(usuarioId, id);
}

/** Rotina de um dia: atividades ordenadas por horário + progresso. */
export async function rotinaDoDia(usuarioId, data) {
    const atividades = await listarAtividades(usuarioId, { data });
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
