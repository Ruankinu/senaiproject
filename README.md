# RITHMO

Plataforma de **rotina diária** que conecta **pacientes e psicólogos**: o
paciente organiza e executa sua rotina; o psicólogo acompanha a consistência
do paciente por um código de vínculo. É um MVP com persistência local em JSON
(não usa banco de dados).

---

## 1. O que já funciona (MVP)

### Paciente

- Login de protótipo (contas demo locais — sem JWT no fluxo do navegador)
- Rotina do dia com data, horário, prioridade e complexidade
- Criar, editar, excluir e concluir/reabrir atividades
- Progresso do dia (concluídas / total, porcentagem)
- Streak de consistência (dias seguidos com pelo menos 1 atividade concluída)
- Conquistas (badges) desbloqueadas — exibidas apenas as conquistadas
- Vínculo com psicólogo por código
- Perfil com identidade, informações e "Minhas conquistas"

### Psicólogo

- Login de protótipo
- Código de vínculo (ex.: `RITMO1`) com botão de copiar
- Lista de pacientes vinculados (progresso de hoje, atrasadas, streak)
- Acompanhamento da rotina do paciente por dia (‹ anterior / próximo › + Hoje)
- Histórico dos últimos 7 dias
- Perfil com código de vínculo e pacientes vinculados

### Não implementado (futuro — ver seção 8)

O produto ainda não possui IA, análise de carga, insights, recomendações,
notificações ou prontuário clínico.

---

## 2. Stack

### Backend

- Node.js + Express
- Persistência em **arquivos JSON locais** (`backend/data/*.json`)
- `bcryptjs` (hash de senha no cadastro/login da API)
- `jsonwebtoken` (o login da API ainda assina um token; o protótipo do
  frontend **não usa** — entra pela identidade demo `X-Demo-Usuario`)
- `cors`

### Frontend

- React 18 + TypeScript + Vite
- React Router (rotas SPA)
- CSS puro (sem Tailwind, sem biblioteca de UI) — sistema de identidade em
  `frontend/src/styles/global.css`
- Fontes locais via Fontsource (Manrope, Space Grotesk)
- Marca: asset oficial em PNG (`frontend/public/rithmo-*.png`), gerado a
  partir do arquivo enviado pelo usuário (`fca24f18-*.jpg`) — nada de
  redesenho em SVG/CSS

---

## 3. Estrutura

```
RITHMO/
├── backend/
│   ├── controllers/          # Camada HTTP (atividade, auth, paciente, rotina, vínculo)
│   ├── services/             # Regras de negócio (auth, rotina, gamificação, vínculo)
│   ├── routes/               # AuthRoutes (públicas) + ApiRoutes (autenticadas)
│   ├── middleware/           # Identidade demo, restrição por perfil, token
│   ├── db/
│   │   ├── jsonStore.js      # Persistência JSON (arquivos em data/, atômica)
│   │   └── seed.js           # Contas e rotinas de demonstração
│   ├── data/                 # Dados locais do MVP (gerados em runtime, fora do git)
│   ├── utils/                # ApiError + wrapper de handlers
│   ├── server.js             # Express — monta a API e serve o frontend compilado
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes de UI (linha de atividade, marca, botões…)
│   │   ├── pages/            # Páginas (login, cadastro, home, perfil, psicólogo…)
│   │   ├── context/          # AuthContext (sessão do protótipo)
│   │   ├── hooks/            # Carregadores de dados (rotina, progresso, vínculo…)
│   │   ├── lib/              # Cliente da API, auth demo, datas, erros
│   │   ├── styles/           # Identidade visual (global.css)
│   │   └── types/            # Tipos TypeScript
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 4. Como rodar

### Backend (porta 3000 — API + frontend compilado)

```bash
cd backend
npm install
npm run db:reset      # opcional: apaga data/ e semeia do zero
npm start             # ou: npm run dev (reinicia ao salvar)
```

### Frontend (desenvolvimento, porta 5173 — proxy /api → 3000)

```bash
cd frontend
npm install
npm run dev
```

### Frontend (build de produção)

```bash
cd frontend
npm run build
```

O backend serve o build em `frontend/dist` na mesma origem (`http://localhost:3000`).

Variáveis de ambiente: `PORT` (padrão 3000) e `JWT_SECRET` (segredo do token,
usado apenas se algum cliente consumir o login da API).

---

## 5. Arquitetura

```
Frontend (React + Vite)
      │  fetch relativo (/api …)
      ▼
API Express (backend/server.js)
      │  rotas → controllers → services
      ▼
Services (regras de negócio)
      ▼
JSON local (backend/data/*.json)
```

- **Controllers**: recebem a requisição e respondem HTTP (300/400/401/403/404/500).
- **Services**: regras de negócio (validação, cálculo de streak/badges, vínculo).
- **jsonStore**: camada de persistência — carrega as coleções na memória na
  inicialização e grava cada mutação de forma atômica (arquivo temporário +
  rename), serializada por coleção.

---

## 6. Dados (JSON local)

- Local: `backend/data/` (`usuarios.json`, `psicologos.json`, `vinculos.json`,
  `atividades.json`).
- O repositório **não depende de MySQL** — não há schema, conexão nem scripts SQL.
- Ao iniciar, o servidor carrega (ou cria) os arquivos; cada mutação é persistida
  imediatamente no disco.
- `npm run db:seed` — semeia de forma idempotente (não duplica contas/rotinas).
- `npm run db:reset` — apaga tudo e semeia do zero.
- Os arquivos estão fora do git (`.gitignore` → `data/`): cada ambiente gera os
  seus dados locais.

### Contas de demonstração

| Perfil    | E-mail                   | Senha  | Código de vínculo |
| --------- | ------------------------ | ------ | ----------------- |
| Paciente  | ana@rithmo.app          | 123456 | —                 |
| Paciente  | lucas@rithmo.app        | 123456 | —                 |
| Psicóloga | psicologa@rithmo.app    | 123456 | `RITMO1`          |

---

## 7. API

Base: `/api`. As rotas de **produto** usam a identidade de protótipo no
cabeçalho `X-Demo-Usuario: <id>` (id da conta demo — 1 psicóloga, 2 Ana,
3 Lucas). Os endpoints de `POST /api/auth/*` são públicos e devolvem token +
usuário (contrato real da API), mas o frontend do protótipo não usa o token.

### Auth (públicas)

| Método | Caminho             | Body                                                       | Resposta                          |
| ------ | ------------------- | ---------------------------------------------------------- | --------------------------------- |
| POST   | /api/auth/registro  | `{ nome, email, senha, perfil: 'paciente'\|'psicologo' }`  | `201 { token, usuario }`          |
| POST   | /api/auth/login     | `{ email, senha }`                                          | `200 { token, usuario }`          |

### Perfil (autenticado)

| Método | Caminho | Resposta                                                                                                  |
| ------ | ------- | --------------------------------------------------------------------------------------------------------- |
| GET    | /api/me | `{ usuario }` — psicólogo: + `codigo`, `pacientesVinculados`; paciente: + `psicologoVinculado` (ou `null`) |

### Rotina (paciente)

| Método | Caminho                      | Parâmetros/body                                                      | Resposta                    |
| ------ | ---------------------------- | -------------------------------------------------------------------- | --------------------------- |
| GET    | /api/atividades              | `?status=` `?data=YYYY-MM-DD`                                        | `{ quantidade, atividades }` |
| POST   | /api/atividades              | `{ titulo, prazo, descricao?, horario?, prioridade?, complexidade? }` | `201 { atividade }`         |
| GET    | /api/atividades/:id          | —                                                                    | `{ atividade }`             |
| PUT    | /api/atividades/:id          | parcial: quaisquer campos acima                                      | `{ atividade }`             |
| DELETE | /api/atividades/:id          | —                                                                    | `{ mensagem }`              |
| PATCH  | /api/atividades/:id/concluir | —                                                                    | `{ atividade }` (alterna)   |
| GET    | /api/rotina/hoje             | `?data=YYYY-MM-DD` (padrão: hoje)                                    | `{ rotina }`                |

Enums: `prioridade` = `Baixa | Média | Alta` (padrão Média); `complexidade` =
`Fácil | Moderada | Intensa` (padrão Moderada); `status` = `Pendente | Concluída`.

### Gamificação (paciente)

| Método | Caminho       | Resposta                                                                          |
| ------ | ------------- | --------------------------------------------------------------------------------- |
| GET    | /api/progresso | `{ progresso: { streak, melhorStreak, badges[] } }` — badge: `{ id, nome, meta, aberta, progresso }` |

### Vínculo

| Método | Caminho     | Body          | Resposta                                                        |
| ------ | ----------- | ------------- | --------------------------------------------------------------- |
| GET    | /api/vinculo | —            | paciente: `{ psicologo }`; psicólogo: `{ codigo }`              |
| POST   | /api/vinculo | `{ codigo }`  | `201 { mensagem, psicologo }` (paciente cria o vínculo)         |

### Pacientes (psicólogo)

| Método | Caminho                        | Parâmetros              | Resposta                                             |
| ------ | ------------------------------ | ----------------------- | ---------------------------------------------------- |
| GET    | /api/pacientes                 | —                       | `{ pacientes[] }` — hoje, atrasadas, streak          |
| GET    | /api/pacientes/:id/resumo      | —                       | `{ resumo }` — hoje, atrasadas, últimos 7 dias, progresso |
| GET    | /api/pacientes/:id/rotina      | `?data=YYYY-MM-DD`      | `{ rotina }`                                         |

### Erros

Mensagens previsíveis em `{ mensagem }`: `400` entrada inválida, `401` sem
sessão demo/credenciais, `403` perfil sem acesso, `404` recurso inexistente,
`500` erro interno.

> As antigas rotas de tarefas (`/cadastrarTarefa`, `GET /:id`…) foram
> **removidas** nesta organização — pertenciam à arquitetura anterior e não
> eram usadas pelo produto.

---

## 8. Gamificação — regras reais

- Um dia conta para a **sequência** quando o paciente concluiu **pelo menos
  uma** atividade planejada naquele dia (`prazo` = dia).
- A sequência continua viva mesmo sem atividade concluída hoje (usado o
  ontem como referência).
- `streak` = sequência atual; `melhorStreak` = melhor sequência histórica.
- Badges (baseados na **melhor** sequência):
  - `primeiro-passo` — 1 dia
  - `sete-dias` — 7 dias
  - `um-mes` — 30 dias
  - `seis-meses` — 180 dias
  - `um-ano` — 365 dias

O frontend exibe no Perfil apenas as **conquistas desbloqueadas** (nome,
descrição curta) e, na home, um resumo da consistência — sem revelar
requisitos de conquistas ainda não alcançadas.

---

## 9. Perfis

```
Paciente  →  rotina própria  →  progresso + streak + conquistas  →  vínculo com psicólogo
Psicólogo →  pacientes vinculados (código)  →  visualização da rotina por dia + histórico
```

O Perfil é a **identidade** do usuário (avatar/símbolo, nome, e-mail, perfil e
conquistas). O backend não possui campo de data de nascimento — a interface
apresenta o espaço como "disponível em breve", sem inventar dados.

---

## 10. Futuro (não implementado)

- Assistente de rotina baseado em IA
- Análise de carga e insights
- Recomendações automáticas
- Notificações
- Prontuário clínico
- Autenticação real no fluxo do navegador (hoje o login é protótipo local)

---

## 11. Identidade visual

Produto premium, digital e leve: fundo off-white/lavanda claro, **roxo escuro**
como cor principal, **verde** como acento funcional (sucesso/progresso/
conquistas) e branco dominante. Tipografia: Manrope (interface), Space Grotesk
(títulos) e Quicksand (wordmark). Ícone oficial (infinito de ritmo + folha +
"rithmo" em caixa baixa) reestilizado em roxo/branco/verde.

Acessibilidade: labels reais, foco visível, contraste AA, `aria-*`, áreas
clicáveis adequadas; responsivo (mobile, tablet, desktop); estados de
loading/esqueleto, vazio e erro.
