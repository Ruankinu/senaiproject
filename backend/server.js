import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AuthRoutes from './routes/AuthRoutes.js';
import ApiRoutes from './routes/ApiRoutes.js';
import { usuarioDemonstracao } from './middleware/auth.js';
import { iniciar } from './db/jsonStore.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// O frontend compilado fica em frontend/ (na raiz do repositório).
const DIST = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.json());
app.use(cors());

// API: nunca servir respostas JSON em cache (evita que um navegador com
// resposta antiga de /api continue vendo "Autenticação necessária.").
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// API do MVP (protótipo: identidade de demonstração, sem JWT no fluxo)
app.use('/api/auth', AuthRoutes);
app.use('/api', usuarioDemonstracao, ApiRoutes);

// Frontend compilado servido na MESMA origem (porta 3000): o preview abre o
// aplicativo por um único endereço — app E API juntos, sem "card errado".
const INDEX = path.join(DIST, 'index.html');
if (fs.existsSync(INDEX)) {
    // index:false — a raiz só vira o app quando o cliente aceita HTML;
    // clientes JSON (rotas legadas) continuam recebendo JSON.
    // Assets têm hash no nome → imutáveis; HTML nunca em cache.
    app.use(
        '/assets',
        express.static(path.join(DIST, 'assets'), {
            maxAge: '365d',
            immutable: true
        })
    );
    app.use(
        express.static(DIST, {
            index: false,
            setHeaders: (res, caminho) => {
                if (caminho.endsWith('.html')) {
                    res.setHeader('Cache-Control', 'no-store');
                }
            }
        })
    );

    // Fallback SPA para rotas do app (/login, /psicologo, ...). Aceita apenas
    // navegação HTML; chamadas JSON (API/rotas legadas) seguem para baixo.
    app.get(/.*/, (req, res, next) => {
        if (!req.accepts('html') || req.path.startsWith('/api')) return next();
        const arquivo = path.join(DIST, req.path.replace(/^\//, ''));
        if (req.path !== '/' && fs.existsSync(arquivo) && fs.statSync(arquivo).isFile()) {
            return res.sendFile(arquivo, {
                headers: { 'Cache-Control': 'no-store' }
            });
        }
        return res.sendFile(INDEX, {
            headers: { 'Cache-Control': 'no-store' }
        });
    });
}

// Persistência JSON: carrega (ou cria) data/*.json antes de aceitar conexões.
await iniciar();

const PORTA = Number(process.env.PORT || 3000);

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
    if (fs.existsSync(INDEX)) {
        console.log(`Frontend compilado servido em http://localhost:${PORTA}/`);
    } else {
        console.log('Aviso: frontend/dist ausente — rode "npm run build" em frontend/');
    }
});
