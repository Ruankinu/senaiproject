import express from 'express';

import {
    cadastrarTarefa,
    listarTarefas,
    buscarTarefaPorId,
    editarTarefa,
    excluirTarefa,
    concluirTarefa
} from '../controllers/ControllerTarefa.js';

const router = express.Router();

router.post('/cadastrarTarefa', cadastrarTarefa);
router.get('/', listarTarefas);
router.get('/:id', buscarTarefaPorId);
router.put('/:id', editarTarefa);
router.delete('/:id', excluirTarefa);
router.patch('/:id/concluir', concluirTarefa);


export default router;