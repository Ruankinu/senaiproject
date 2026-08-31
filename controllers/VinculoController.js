import {
    obterCodigo,
    obterVinculo,
    vincularPorCodigo
} from '../services/vinculoService.js';
import { tratar } from '../utils/tratar.js';

/** Paciente: dados do psicólogo vinculado. Psicólogo: seu código. */
export const estadoVinculoController = tratar(async (req, res) => {
    if (req.usuario.perfil === 'psicologo') {
        const codigo = await obterCodigo(req.usuario.id);
        return res.status(200).json({ codigo });
    }

    const psicologo = await obterVinculo(req.usuario.id);
    return res.status(200).json({ psicologo });
});

/** Paciente informa o código do psicólogo. */
export const vincularController = tratar(async (req, res) => {
    const psicologo = await vincularPorCodigo(req.usuario.id, req.body.codigo);
    return res.status(201).json({
        mensagem: `Vínculo criado com ${psicologo.nome}.`,
        psicologo
    });
});
