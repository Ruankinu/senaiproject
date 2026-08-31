/**
 * RITHMO — Persistência local em JSON (MVP).
 *
 * Substitui a dependência de MySQL/SQLite por arquivos JSON simples em data/.
 * O estado é carregado em memória na inicialização e cada mutação é gravada
 * no disco de forma atômica (arquivo temporário + rename), serializada por
 * coleção para evitar leitura/escrita concorrente.
 *
 * Coleções:
 *   usuarios   — { id, nome, email, senhaHash, perfil, criadoEm }
 *   psicologos — { usuarioId, codigo }
 *   vinculos   — { id, pacienteId, psicologoId, criadoEm }
 *   atividades — { id, usuarioId, titulo, descricao, prazo, horario,
 *                  prioridade, complexidade, status, concluidaEm, criadoEm }
 *   tarefas    — rotas legadas (compatibilidade)
 *
 * IDs são estáveis e nunca reutilizados: novo id = maior id existente + 1.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR_DADOS = path.join(__dirname, '..', 'data');

const COLECOES = ['usuarios', 'psicologos', 'vinculos', 'atividades', 'tarefas'];

// Estado em memória: coleção -> array de registros.
const estado = new Map();
// Fila de escrita por coleção: serializa ler-modificar-gravar.
const filas = new Map();

function caminhoArquivo(nome) {
    return path.join(DIR_DADOS, `${nome}.json`);
}

function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
}

async function carregarColecao(nome) {
    const caminho = caminhoArquivo(nome);
    try {
        const bruto = await fsp.readFile(caminho, 'utf8');
        const dados = JSON.parse(bruto);
        if (!Array.isArray(dados)) {
            throw new Error(`data/${nome}.json não contém um array.`);
        }
        estado.set(nome, dados);
    } catch (erro) {
        if (erro.code === 'ENOENT') {
            estado.set(nome, []);
            await persistir(nome);
            return;
        }
        throw erro;
    }
}

async function persistir(nome) {
    const dados = estado.get(nome);
    const destino = caminhoArquivo(nome);
    const temporario = `${destino}.tmp`;
    await fsp.writeFile(temporario, `${JSON.stringify(dados, null, 2)}\n`, 'utf8');
    await fsp.rename(temporario, destino);
}

/** Executa uma mutação de forma serializada para a coleção. */
async function comFila(nome, operacao) {
    const anterior = filas.get(nome) ?? Promise.resolve();
    const proxima = anterior.then(operacao, operacao);
    filas.set(nome, proxima.catch(() => {}));
    return proxima;
}

/** Inicializa (ou cria) os arquivos JSON. Chamar uma vez antes de servir. */
export async function iniciar() {
    await fsp.mkdir(DIR_DADOS, { recursive: true });
    await Promise.all(COLECOES.map(carregarColecao));
    console.log(
        `Persistência JSON ativa (data/): ${COLECOES
            .map((c) => `${c}=${estado.get(c).length}`)
            .join(', ')}`
    );
}

// ---- Leituras ----

export function listar(nome) {
    return copiar(estado.get(nome) ?? []);
}

export function buscarPorId(nome, id) {
    const registro = (estado.get(nome) ?? []).find((item) => item.id === id);
    return registro ? copiar(registro) : null;
}

export function buscarOnde(nome, predicado) {
    return copiar((estado.get(nome) ?? []).filter(predicado));
}

export function contarOnde(nome, predicado) {
    return (estado.get(nome) ?? []).filter(predicado).length;
}

// ---- Escritas (serializadas por coleção) ----

/** Insere um registro com id estável (maior id + 1). */
export function inserir(nome, registro) {
    return comFila(nome, async () => {
        const colecao = estado.get(nome);
        const proximoId = colecao.reduce((maior, item) => Math.max(maior, item.id ?? 0), 0) + 1;
        const novo = { id: proximoId, ...registro };
        colecao.push(novo);
        await persistir(nome);
        return copiar(novo);
    });
}

/** Atualiza o primeiro registro que satisfaz o predicado. */
export function atualizarOnde(nome, predicado, mudancas) {
    return comFila(nome, async () => {
        const colecao = estado.get(nome);
        const indice = colecao.findIndex(predicado);
        if (indice === -1) return null;
        colecao[indice] = { ...colecao[indice], ...mudancas };
        await persistir(nome);
        return copiar(colecao[indice]);
    });
}

/** Remove o primeiro registro que satisfaz o predicado. */
export function removerOnde(nome, predicado) {
    return comFila(nome, async () => {
        const colecao = estado.get(nome);
        const indice = colecao.findIndex(predicado);
        if (indice === -1) return false;
        colecao.splice(indice, 1);
        await persistir(nome);
        return true;
    });
}

/** Substitui a coleção inteira (usado por seeds/reset). */
export function substituirColecao(nome, dados) {
    return comFila(nome, async () => {
        estado.set(nome, copiar(dados));
        await persistir(nome);
    });
}

/** Apaga todos os dados (reset). */
export async function limparTudo() {
    await Promise.all(
        COLECOES.map((nome) => comFila(nome, async () => {
            estado.set(nome, []);
            await persistir(nome);
        }))
    );
}

/** Verifica se o diretório de dados já contém registros. */
export function colecaoVazia(nome) {
    return (estado.get(nome) ?? []).length === 0;
}

export { DIR_DADOS };
