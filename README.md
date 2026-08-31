# RITHMO

Gerenciador de tarefas com foco em **ordem, ritmo e clareza**.
Backend em Node.js + Express + MySQL e frontend em React + Vite + TypeScript.

## Estrutura

```
.
├── server.js                  # API Express (porta 3000)
├── controllers/               # Lógica das rotas de tarefas
├── routes/                    # Definição das rotas
├── models/                    # Entidade Tarefa
├── db/
│   ├── database.js            # Conexão MySQL
│   └── schema.sql             # Criação do banco e da tabela
├── frontend/                  # Interface RITHMO (React + Vite + TS)
│   └── src/
│       ├── components/        # UI (linha de tarefa, diálogos, toasts…)
│       ├── pages/             # Home e Edição
│       ├── hooks/             # Estado das tarefas (busca + mutações)
│       ├── lib/               # Cliente da API, datas, erros
│       ├── types/             # Tipos do domínio
│       └── styles/            # Sistema visual (elementos, não utilitários)
└── package.json               # Backend
```

## Rodando o projeto

### 1. Banco de dados (MySQL)

```bash
mysql -u root < db/schema.sql
```

### 2. Backend (porta 3000)

```bash
npm install
npm run dev        # ou npm start
```

### 3. Frontend (porta 5173)

```bash
cd frontend
npm install
npm run dev
```

Em desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:3000`.
Em produção, defina `VITE_API_BASE` com a URL pública da API antes do build.

## API

| Método | Rota                   | Descrição                          |
| ------ | ---------------------- | ---------------------------------- |
| POST   | `/cadastrarTarefa`     | Cria uma tarefa                    |
| GET    | `/`                    | Lista (ordenada por prazo)         |
| GET    | `/:id`                 | Busca uma tarefa                   |
| PUT    | `/:id`                 | Atualização parcial                |
| DELETE | `/:id`                 | Exclui                             |
| PATCH  | `/:id/concluir`        | Marca como concluída               |

## Preview sem MySQL instalado

Ambientes sem MySQL (como este sandbox) podem usar um servidor de preview que
fala o protocolo MySQL por cima de SQLite (`mysql-mimic`), apontando a
conexão do backend para ele. Esse servidor **não faz parte do produto** — é
apenas da demonstração e vive fora do repositório (em `preview-db/`,
ignorado pelo git). Em desenvolvimento normal, use MySQL de verdade com
`db/schema.sql`.

## Decisões de produto

- **Sem sidebar**: a aplicação tem uma tela principal; navegação é só a marca + ação primária.
- **Lista em linhas, não cards**: densidade legível com título em primeiro plano e metadados em colunas.
- **Prazo contextual**: Atrasada / Hoje / Amanhã / Em breve, derivados apenas dos dados.
- **Concluir por checkbox**: ação principal com retorno visual imediato (atualização otimista).
- **Edição reutiliza o formulário do cadastro** e permite alterar o status.
- **Exclusão sempre com confirmação** que nomeia a tarefa.
- Uma única cor de destaque (vermelho-petróleo); prioridades usam cores funcionais discretas.
