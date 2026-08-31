import express from 'express';
import cors from 'cors';

import Routes from './routes/Routes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/', Routes);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});