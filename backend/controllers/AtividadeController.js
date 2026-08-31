import {
    listarAtividades,
    criarAtividade,
    buscarAtividade,
    atualizarAtividade,
    excluirAtividade,
    alternarConclusao
} from '../services/rotinaService.js';
import { tratar } from '../utils/tratar.js';

export const listarController = tratar(async (req, res) => {
    const { status, data } = req.query;
    const atividades = await listarAtividades(req.usuario.id, { status, data });
    return res.status(200).json({ quantidade: atividades.length, atividades });
});

export const criarController = tratar(async (req, res) => {
    const atividade = await criarAtividade(req.usuario.id, req.body);
    return res.status(201).json({
        mensagem: 'Atividade criada com sucesso.',
        atividade
    });
});

export const buscarController = tratar(async (req, res) => {
    const atividade = await buscarAtividade(req.usuario.id, req.params.id);
    return res.status(200).json({ atividade });
});

export const atualizarController = tratar(async (req, res) => {
    const atividade = await atualizarAtividade(
        req.usuario.id,
        req.params.id,
        req.body
    );
    return res.status(200).json({
        mensagem: 'Atividade atualizada com sucesso.',
        atividade
    });
});

export const excluirController = tratar(async (req, res) => {
    await excluirAtividade(req.usuario.id, req.params.id);
    return res.status(200).json({ mensagem: 'Atividade excluída com sucesso.' });
});

export const concluirController = tratar(async (req, res) => {
    const atividade = await alternarConclusao(req.usuario.id, req.params.id);
    return res.status(200).json({
        mensagem:
            atividade.status === 'Concluída'
                ? 'Atividade concluída.'
                : 'Atividade reaberta.',
        atividade
    });
});
