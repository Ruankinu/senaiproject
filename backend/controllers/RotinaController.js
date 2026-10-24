import { rotinaDoDia } from '../services/rotinaService.js';
import { obterProgresso } from '../services/gamificacaoService.js';
import { tratar } from '../utils/tratar.js';

export const rotinaHojeController = tratar(async (req, res) => {
    const data = req.query.data || null;

    let dataFinal = data;
    if (!dataFinal) {
        const agora = new Date();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        dataFinal = `${agora.getFullYear()}-${mes}-${dia}`;
    }

    const rotina = await rotinaDoDia(req.usuario.id, dataFinal);
    return res.status(200).json({ rotina });
});

export const progressoController = tratar(async (req, res) => {
    const progresso = await obterProgresso(req.usuario.id);
    return res.status(200).json({ progresso });
});
