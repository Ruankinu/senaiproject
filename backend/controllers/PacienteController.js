import { rotinaDoDia } from '../services/rotinaService.js';
import { obterResumoPaciente } from '../services/gamificacaoService.js';
import {
    listarPacientes,
    validarAcessoPaciente
} from '../services/vinculoService.js';
import { tratar } from '../utils/tratar.js';

export const listarPacientesController = tratar(async (req, res) => {
    const pacientes = await listarPacientes(req.usuario.id);
    return res.status(200).json({ pacientes });
});

export const resumoPacienteController = tratar(async (req, res) => {
    await validarAcessoPaciente(req.usuario.id, req.params.id);
    const resumo = await obterResumoPaciente(req.params.id);
    return res.status(200).json({ resumo });
});

export const rotinaPacienteController = tratar(async (req, res) => {
    await validarAcessoPaciente(req.usuario.id, req.params.id);

    const data = req.query.data || null;
    let dataFinal = data;
    if (!dataFinal) {
        const agora = new Date();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        dataFinal = `${agora.getFullYear()}-${mes}-${dia}`;
    }

    const rotina = await rotinaDoDia(req.params.id, dataFinal);
    return res.status(200).json({ rotina });
});
