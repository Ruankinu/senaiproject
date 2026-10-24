import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buscarPorId, atualizarOnde } from '../db/jsonStore.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * CIP — Carteira de Identidade Profissional, emitida pelo CRP.
 * O arquivo (PDF ou foto) fica em backend/uploads/cip/ e o JSON do usuário
 * guarda só os metadados + o nome do arquivo no disco. Somente o próprio
 * psicólogo consegue baixar o documento (ver localizarDocumento).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_CIP = path.join(__dirname, '..', 'uploads', 'cip');
const TAMANHO_MAX = 10 * 1024 * 1024; // 10 MB

const EXTENSOES = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const ASSINATURA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Confere os primeiros bytes, pra não aceitar outro tipo de arquivo com o mime trocado. */
function assinaturaConfere(buffer, mime) {
    if (mime === 'application/pdf') {
        return buffer.subarray(0, 4).toString('latin1') === '%PDF';
    }
    if (mime === 'image/jpeg') {
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (mime === 'image/png') {
        return buffer.subarray(0, 8).equals(ASSINATURA_PNG);
    }
    if (mime === 'image/webp') {
        return (
            buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
            buffer.subarray(8, 12).toString('latin1') === 'WEBP'
        );
    }
    return false;
}

function nomeSeguro(nome, extensao) {
    const base = path
        .basename(String(nome ?? ''))
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f<>:"/\\|?*]/g, '')
        .trim()
        .slice(0, 120);
    return base || `cip.${extensao}`;
}

/** Metadados públicos (sem o nome do arquivo no disco). */
export function metaDocumento(doc) {
    if (!doc) return null;
    return {
        nome: doc.nome,
        tipo: doc.tipo,
        tamanho: doc.tamanho,
        enviadoEm: doc.enviadoEm
    };
}

async function removerArquivo(arquivo) {
    if (!arquivo) return;
    await fsp.rm(path.join(DIR_CIP, arquivo), { force: true });
}

function exigirPsicologo(usuarioId) {
    const usuario = buscarPorId('usuarios', Number(usuarioId));
    if (!usuario) throw new ApiError(404, 'Usuário não encontrado.');
    if (usuario.perfil !== 'psicologo') {
        throw new ApiError(403, 'Apenas psicólogos podem anexar a CIP.');
    }
    return usuario;
}

/** Envia a CIP. Se já existir uma, ela é substituída (e o arquivo antigo apagado). */
export async function enviarDocumento(usuarioId, { dataUrl, nomeArquivo } = {}) {
    const usuario = exigirPsicologo(usuarioId);

    if (typeof dataUrl !== 'string') throw new ApiError(400, 'Envie um arquivo.');
    const partes = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(dataUrl);
    if (!partes) throw new ApiError(400, 'Arquivo inválido.');

    const mime = partes[1].toLowerCase();
    const extensao = EXTENSOES[mime];
    if (!extensao) {
        throw new ApiError(400, 'Envie a CIP em PDF ou foto (JPG, PNG ou WEBP).');
    }

    const buffer = Buffer.from(partes[2], 'base64');
    if (buffer.length === 0) throw new ApiError(400, 'O arquivo está vazio.');
    if (buffer.length > TAMANHO_MAX) throw new ApiError(400, 'O arquivo passa de 10 MB.');
    if (!assinaturaConfere(buffer, mime)) {
        throw new ApiError(400, 'O conteúdo do arquivo não confere com o tipo enviado.');
    }

    fs.mkdirSync(DIR_CIP, { recursive: true });
    const arquivo = `${usuario.id}-${crypto.randomUUID()}.${extensao}`;
    await fsp.writeFile(path.join(DIR_CIP, arquivo), buffer);

    const doc = {
        arquivo,
        nome: nomeSeguro(nomeArquivo, extensao),
        tipo: mime,
        tamanho: buffer.length,
        enviadoEm: new Date().toISOString()
    };

    const anterior = usuario.documento?.arquivo;
    await atualizarOnde('usuarios', (u) => u.id === usuario.id, { documento: doc });
    await removerArquivo(anterior);

    return metaDocumento(doc);
}

export async function removerDocumento(usuarioId) {
    const usuario = exigirPsicologo(usuarioId);
    const anterior = usuario.documento?.arquivo;
    await atualizarOnde('usuarios', (u) => u.id === usuario.id, { documento: null });
    await removerArquivo(anterior);
}

/** Caminho no disco + tipo, para o próprio psicólogo baixar/visualizar a CIP. */
export function localizarDocumento(usuarioId) {
    const usuario = exigirPsicologo(usuarioId);
    const doc = usuario.documento;
    if (!doc?.arquivo) throw new ApiError(404, 'Nenhuma CIP anexada.');
    const caminho = path.join(DIR_CIP, doc.arquivo);
    if (!fs.existsSync(caminho)) {
        throw new ApiError(404, 'O arquivo da CIP não foi encontrado.');
    }
    return { caminho, tipo: doc.tipo, nome: doc.nome };
}
