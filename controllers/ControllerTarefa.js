import {
    buscarOnde,
    buscarPorId,
    inserir,
    atualizarOnde,
    removerOnde
} from '../db/jsonStore.js';

/**
 * Rotas legadas de tarefas (mantidas por compatibilidade).
 * Antes usavam MySQL direto; agora usam a persistência JSON.
 * O contrato externo permanece idêntico (mitigando o risco de quebra).
 */

function paraResposta(linha) {
    return {
        id: linha.id,
        titulo: linha.titulo,
        tarefa: linha.tarefa,
        prazo: linha.prazo,
        prioridade: linha.prioridade,
        status: linha.status,
        criado_em: linha.criadoEm
    };
}

function idValido(req, res) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        res.status(400).json({ mensagem: 'ID da tarefa inválido.' });
        return null;
    }
    return id;
}

export const cadastrarTarefa = async (req, res) => {
    try {
        const { titulo, tarefa, prazo, prioridade } = req.body;

        if (!titulo || !tarefa || !prazo) {
            return res.status(400).json({
                mensagem: 'Título, tarefa e prazo são obrigatórios.'
            });
        }

        const linha = await inserir('tarefas', {
            titulo,
            tarefa,
            prazo,
            prioridade: prioridade || 'Média',
            status: 'Pendente',
            criadoEm: new Date().toISOString()
        });

        return res.status(201).json({
            mensagem: 'Tarefa cadastrada com sucesso',
            tarefa: paraResposta(linha)
        });
    } catch (erro) {
        console.error('[tarefa] Erro ao cadastrar:', erro);
        return res.status(500).json({ mensagem: 'Erro ao cadastrar tarefa.' });
    }
};

export const listarTarefas = (req, res) => {
    try {
        const tarefas = buscarOnde('tarefas', () => true)
            .sort((a, b) => String(a.prazo).localeCompare(String(b.prazo)))
            .map(paraResposta);

        return res.status(200).json({ quantidade: tarefas.length, tarefas });
    } catch (erro) {
        console.error('[tarefa] Erro ao listar:', erro);
        return res.status(500).json({ mensagem: 'Erro ao listar tarefas.' });
    }
};

export const buscarTarefaPorId = (req, res) => {
    const id = idValido(req, res);
    if (id === null) return;

    const linha = buscarPorId('tarefas', id);
    if (!linha) {
        return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }

    return res.status(200).json({ tarefa: paraResposta(linha) });
};

export const editarTarefa = async (req, res) => {
    const id = idValido(req, res);
    if (id === null) return;

    const { titulo, tarefa, prazo, prioridade, status } = req.body;

    if (
        titulo === undefined &&
        tarefa === undefined &&
        prazo === undefined &&
        prioridade === undefined &&
        status === undefined
    ) {
        return res.status(400).json({
            mensagem: 'Nenhum dado foi enviado para atualização.'
        });
    }

    if (!buscarPorId('tarefas', id)) {
        return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }

    const mudancas = {};
    if (titulo !== undefined) mudancas.titulo = titulo;
    if (tarefa !== undefined) mudancas.tarefa = tarefa;
    if (prazo !== undefined) mudancas.prazo = prazo;
    if (prioridade !== undefined) mudancas.prioridade = prioridade;
    if (status !== undefined) mudancas.status = status;

    const linha = await atualizarOnde('tarefas', (t) => t.id === id, mudancas);

    return res.status(200).json({
        mensagem: 'Tarefa atualizada com sucesso',
        tarefa: paraResposta(linha)
    });
};

export const excluirTarefa = async (req, res) => {
    const id = idValido(req, res);
    if (id === null) return;

    if (!buscarPorId('tarefas', id)) {
        return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }

    await removerOnde('tarefas', (t) => t.id === id);
    return res.status(200).json({ mensagem: 'Tarefa excluída com sucesso.' });
};

export const concluirTarefa = async (req, res) => {
    const id = idValido(req, res);
    if (id === null) return;

    if (!buscarPorId('tarefas', id)) {
        return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
    }

    const linha = await atualizarOnde(
        'tarefas',
        (t) => t.id === id,
        { status: 'Concluída' }
    );

    return res.status(200).json({
        mensagem: 'Tarefa concluída com sucesso',
        tarefa: paraResposta(linha)
    });
};
