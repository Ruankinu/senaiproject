import Tarefa from '../models/Tarefa.js';
import conexao from '../db/database.js';

export const cadastrarTarefa = (req, res) => {
    try {
        const { titulo, tarefa, prazo, prioridade } = req.body;

        if (!titulo || !tarefa || !prazo) {
            return res.status(400).json({
                mensagem: 'Título, tarefa e prazo são obrigatórios.'
            });
        }

        const prioridadeFinal = prioridade || 'Média';

        const sql = `
            INSERT INTO tarefas
            (titulo, tarefa, prazo, prioridade, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        conexao.query(
            sql,
            [titulo, tarefa, prazo, prioridadeFinal, 'Pendente'],
            (erro, resultado) => {

                if (erro) {
                    console.error('Erro ao cadastrar tarefa:', erro);

                    return res.status(500).json({
                        mensagem: 'Erro ao cadastrar tarefa.'
                    });
                }

                const novaTarefa = new Tarefa(
                    resultado.insertId,
                    titulo,
                    tarefa,
                    prazo,
                    prioridadeFinal
                );

                novaTarefa.status = 'Pendente';

                return res.status(201).json({
                    mensagem: 'Tarefa cadastrada com sucesso',
                    tarefa: novaTarefa
                });
            }
        );

    } catch (erro) {
        console.error('Erro interno:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno do servidor.'
        });
    }
};

export const listarTarefas = (req, res) => {

    const sql = `
        SELECT
            id,
            titulo,
            tarefa,
            prazo,
            prioridade,
            status,
            criado_em
        FROM tarefas
        ORDER BY prazo ASC
    `;

    conexao.query(sql, (erro, resultados) => {

        if (erro) {
            console.error('Erro ao listar tarefas:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao listar tarefas.'
            });
        }

        return res.status(200).json({
            quantidade: resultados.length,
            tarefas: resultados
        });
    });
};
export const buscarTarefaPorId = (req, res) => {

    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensagem: 'ID da tarefa inválido.'
        });
    }

    const sql = `
        SELECT
            id,
            titulo,
            tarefa,
            prazo,
            prioridade,
            status,
            criado_em
        FROM tarefas
        WHERE id = ?
    `;

    conexao.query(sql, [id], (erro, resultados) => {

        if (erro) {
            console.error('Erro ao buscar tarefa:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao buscar tarefa.'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: 'Tarefa não encontrada.'
            });
        }

        return res.status(200).json({
            tarefa: resultados[0]
        });
    });
};

export const editarTarefa = (req, res) => {

    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensagem: 'ID da tarefa inválido.'
        });
    }

    const {
        titulo,
        tarefa,
        prazo,
        prioridade,
        status
    } = req.body;

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

    const sqlVerificar = `
        SELECT id
        FROM tarefas
        WHERE id = ?
    `;

    conexao.query(sqlVerificar, [id], (erro, resultados) => {

        if (erro) {
            console.error('Erro ao verificar tarefa:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao verificar tarefa.'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: 'Tarefa não encontrada.'
            });
        }

        const campos = [];
        const valores = [];

        if (titulo !== undefined) {
            campos.push('titulo = ?');
            valores.push(titulo);
        }

        if (tarefa !== undefined) {
            campos.push('tarefa = ?');
            valores.push(tarefa);
        }

        if (prazo !== undefined) {
            campos.push('prazo = ?');
            valores.push(prazo);
        }

        if (prioridade !== undefined) {
            campos.push('prioridade = ?');
            valores.push(prioridade);
        }

        if (status !== undefined) {
            campos.push('status = ?');
            valores.push(status);
        }

        valores.push(id);

        const sql = `
            UPDATE tarefas
            SET ${campos.join(', ')}
            WHERE id = ?
        `;

        conexao.query(sql, valores, (erro) => {

            if (erro) {
                console.error('Erro ao editar tarefa:', erro);

                return res.status(500).json({
                    mensagem: 'Erro ao editar tarefa.'
                });
            }

            const sqlBuscar = `
                SELECT
                    id,
                    titulo,
                    tarefa,
                    prazo,
                    prioridade,
                    status,
                    criado_em
                FROM tarefas
                WHERE id = ?
            `;

            conexao.query(sqlBuscar, [id], (erro, resultados) => {

                if (erro) {
                    console.error('Erro ao buscar tarefa atualizada:', erro);

                    return res.status(500).json({
                        mensagem: 'Tarefa atualizada, mas houve erro ao retorná-la.'
                    });
                }

                return res.status(200).json({
                    mensagem: 'Tarefa atualizada com sucesso',
                    tarefa: resultados[0]
                });
            });
        });
    });
};


export const excluirTarefa = (req, res) => {

    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensagem: 'ID da tarefa inválido.'
        });
    }

    const sqlVerificar = `
        SELECT id
        FROM tarefas
        WHERE id = ?
    `;

    conexao.query(sqlVerificar, [id], (erro, resultados) => {

        if (erro) {
            console.error('Erro ao verificar tarefa:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao verificar tarefa.'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: 'Tarefa não encontrada.'
            });
        }

        const sql = `
            DELETE FROM tarefas
            WHERE id = ?
        `;

        conexao.query(sql, [id], (erro) => {

            if (erro) {
                console.error('Erro ao excluir tarefa:', erro);

                return res.status(500).json({
                    mensagem: 'Erro ao excluir tarefa.'
                });
            }

            return res.status(200).json({
                mensagem: 'Tarefa excluída com sucesso.'
            });
        });
    });
};

export const concluirTarefa = (req, res) => {

    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensagem: 'ID da tarefa inválido.'
        });
    }

    const sqlVerificar = `
        SELECT id
        FROM tarefas
        WHERE id = ?
    `;

    conexao.query(sqlVerificar, [id], (erro, resultados) => {

        if (erro) {
            console.error('Erro ao verificar tarefa:', erro);

            return res.status(500).json({
                mensagem: 'Erro ao verificar tarefa.'
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensagem: 'Tarefa não encontrada.'
            });
        }

        const sql = `
            UPDATE tarefas
            SET status = ?
            WHERE id = ?
        `;

        conexao.query(
            sql,
            ['Concluída', id],
            (erro) => {

                if (erro) {
                    console.error('Erro ao concluir tarefa:', erro);

                    return res.status(500).json({
                        mensagem: 'Erro ao concluir tarefa.'
                    });
                }

                const sqlBuscar = `
                    SELECT
                        id,
                        titulo,
                        tarefa,
                        prazo,
                        prioridade,
                        status,
                        criado_em
                    FROM tarefas
                    WHERE id = ?
                `;

                conexao.query(
                    sqlBuscar,
                    [id],
                    (erro, resultados) => {

                        if (erro) {
                            console.error(
                                'Erro ao buscar tarefa concluída:',
                                erro
                            );

                            return res.status(500).json({
                                mensagem: 'Tarefa concluída, mas houve erro ao retorná-la.'
                            });
                        }

                        return res.status(200).json({
                            mensagem: 'Tarefa concluída com sucesso',
                            tarefa: resultados[0]
                        });
                    }
                );
            }
        );
    });
};