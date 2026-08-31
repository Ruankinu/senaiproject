import express from 'express';
import cors from 'cors';

import AuthRoutes from './routes/AuthRoutes.js';
import ApiRoutes from './routes/ApiRoutes.js';
import Routes from './routes/Routes.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(express.json());
app.use(cors());

// API do MVP (autenticada)
app.use('/api/auth', AuthRoutes);
app.use('/api', requireAuth, ApiRoutes);

// Rotas legadas de tarefas (mantidas por compatibilidade)
app.use('/', Routes);

const PORTA = Number(process.env.PORT || 3000);

app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});
