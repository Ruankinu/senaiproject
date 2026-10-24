import express from 'express';
import {
    perfilController,
    atualizarFotoController,
    atualizarPerfilController,
    alterarSenhaController
} from '../controllers/AuthController.js';
import {
    listarController,
    criarController,
    buscarController,
    atualizarController,
    excluirController,
    concluirController
} from '../controllers/AtividadeController.js';
import {
    rotinaHojeController,
    progressoController
} from '../controllers/RotinaController.js';
import {
    estadoVinculoController,
    vincularController
} from '../controllers/VinculoController.js';
import {
    listarPacientesController,
    resumoPacienteController,
    rotinaPacienteController
} from '../controllers/PacienteController.js';
import {
    enviarDocumentoController,
    removerDocumentoController,
    baixarDocumentoController
} from '../controllers/DocumentoController.js';
import { exigirPerfil } from '../middleware/auth.js';

const router = express.Router();

// Perfil do usuário autenticado
router.get('/me', perfilController);
router.patch('/me', atualizarPerfilController);
router.patch('/me/senha', alterarSenhaController); // NOVO
router.patch('/me/foto', atualizarFotoController);

// CIP (carteira de identidade profissional do CRP) — só psicólogo
router.get('/me/documento', baixarDocumentoController);
router.post('/me/documento', enviarDocumentoController);
router.delete('/me/documento', removerDocumentoController);

// Núcleo 1 — Rotina (paciente)
router.get('/atividades', listarController);
router.post('/atividades', criarController);
router.get('/atividades/:id', buscarController);
router.put('/atividades/:id', atualizarController);
router.delete('/atividades/:id', excluirController);
router.patch('/atividades/:id/concluir', concluirController);
router.get('/rotina/hoje', exigirPerfil('paciente'), rotinaHojeController);

// Núcleo 2 — Acompanhamento e gamificação
router.get(
    '/progresso',
    exigirPerfil('paciente'),
    progressoController
);
router.get('/vinculo', estadoVinculoController);
router.post('/vinculo', exigirPerfil('paciente'), vincularController);
router.get(
    '/pacientes',
    exigirPerfil('psicologo'),
    listarPacientesController
);
router.get(
    '/pacientes/:id/resumo',
    exigirPerfil('psicologo'),
    resumoPacienteController
);
router.get(
    '/pacientes/:id/rotina',
    exigirPerfil('psicologo'),
    rotinaPacienteController
);

export default router;