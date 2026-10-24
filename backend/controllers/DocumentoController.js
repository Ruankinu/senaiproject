import {
    enviarDocumento,
    removerDocumento,
    localizarDocumento
} from '../services/documentoService.js';
import { tratar } from '../utils/tratar.js';

// POST /api/me/documento — anexa (ou substitui) a CIP do psicólogo.
export const enviarDocumentoController = tratar(async (req, res) => {
    const { dataUrl, nomeArquivo } = req.body ?? {};
    const documento = await enviarDocumento(req.usuario.id, { dataUrl, nomeArquivo });
    return res.status(201).json({ documento });
});

// DELETE /api/me/documento — remove a CIP anexada.
export const removerDocumentoController = tratar(async (req, res) => {
    await removerDocumento(req.usuario.id);
    return res.status(200).json({ mensagem: 'CIP removida.' });
});

// GET /api/me/documento — devolve o arquivo (só o próprio psicólogo).
export const baixarDocumentoController = tratar(async (req, res) => {
    const { caminho, tipo, nome } = localizarDocumento(req.usuario.id);
    res.setHeader('Content-Type', tipo);
    res.setHeader(
        'Content-Disposition',
        `inline; filename*=UTF-8''${encodeURIComponent(nome)}`
    );
    return res.sendFile(caminho);
});
