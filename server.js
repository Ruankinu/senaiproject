import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AuthRoutes from './routes/AuthRoutes.js';
import ApiRoutes from './routes/ApiRoutes.js';
import Routes from './routes/Routes.js';
import { requireAuth } from './middleware/auth.js';
import { iniciar } from './db/jsonStore.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'frontend', 'dist');

app.use(express.json());
app.use(cors());

// API do MVP (autenticada)
app.use('/api/auth', AuthRoutes);
app.use('/api', requireAuth, ApiRoutes);

// Frontend compilado servido na MESMA origem (porta 3000): o preview abre o
// aplicativo por um único endereço — app E API juntos, sem "card errado".
const INDEX = path.join(DIST, 'index.html');
if (fs.existsSync(INDEX)) {
    // index:false — a raiz só vira o app quando o cliente aceita HTML;
    // clientes JSON (rotas legadas) continuam recebendo JSON.
    app.use(express.static(DIST, { index: false }));

    // Fallback SPA para rotas do app (/login, /psicologo, ...). Aceita apenas
    // navegação HTML; chamadas JSON (API/rotas legadas) seguem para baixo.
    app.get(/.*/, (req, res, next) => {
        if (!req.accepts('html') || req.path.startsWith('/api')) return next();
        const arquivo = path.join(DIST, req.path.replace(/^\//, ''));
        if (req.path !== '/' && fs.existsSync(arquivo) && fs.statSync(arquivo).isFile()) {
            return res.sendFile(arquivo);
        }
        return res.sendFile(INDEX);
    });
}

// Rotas legadas de tarefas (mantidas por compatibilidade)
app.use('/', Routes);

const PORTA = Number(process.env.PORT || 3000);

// Persistência JSON: carrega (ou cria) data/*.json antes de aceitar conexões.
await iniciar();

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
    if (fs.existsSync(INDEX)) {
        console.log(`Frontend compilado servido em http://localhost:${PORTA}/`);
    } else {
        console.log('Aviso: frontend/dist ausente — rode "npm run build" em frontend/');
    }
});
