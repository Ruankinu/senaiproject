# RITHMO

Plataforma de **rotina diária** que conecta **pacientes e psicólogos**:
o paciente organiza e executa sua rotina; o psicólogo acompanha a consistência
do paciente. O design é editorial e funcional: tipografia, espaço e hierarquia —
sem dashboards genéricos nem efeitos decorativos.

## Visão de produto

```
Paciente ↔ Rotina ↔ Psicólogo
```

1. **Rotina** — atividades com data, horário, prioridade e complexidade.
2. **Acompanhamento** — vínculo real paciente ↔ psicólogo (por código).
3. **Gamificação** — streak e conquistas calculadas dos dados reais.
4. **Inteligência (futuro)** — a arquitetura já separa serviços para receber
   interpretação de rotina; a camada de IA **não diagnostica** nem substitui
   o psicólogo.

## Estrutura

```
├── server.js                  # Express — monta /api/auth, /api e rotas legadas
├── middleware/auth.js         # JWT + restrição por perfil
├── services/                  # Regras de negócio (auth, rotina, gamificação, vínculo)
├── controllers/               # Entrada HTTP (MVP + legado de tarefas)
├── routes/                    # AuthRoutes (públicas), ApiRoutes (autenticadas)
├── models/                    # Entidade legada Tarefa
├── db/
│   ├── database.js            # Pool MySQL (env: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
│   ├── schema.sql             # usuarios, psicologos, vinculos, atividades
│   └── seed.js                # Contas e rotinas de demonstração
├── utils/                     # ApiError, wrapper de handlers
└── frontend/                  # React + Vite + TypeScript
```

## Executando

```bash
# 1. Banco
mysql -u root < db/schema.sql

# 2. Backend (porta 3000)
npm install
npm run dev            # ou: npm start

# 3. Seed de demonstração (opcional)
npm run db:seed

# 4. Frontend (porta 5173)
cd frontend && npm install && npm run dev
```

Variáveis de ambiente do backend: `PORT`, `JWT_SECRET`, `DB_HOST`,
`DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

## Conta de demonstração

| Perfil     | E-mail                    | Senha   | Código de vínculo |
| ---------- | ------------------------- | ------- | ----------------- |
| Paciente   | ana@rithmo.app           | 123456  | —                 |
| Paciente   | lucas@rithmo.app         | 123456  | —                 |
| Psicóloga  | psicologa@rithmo.app     | 123456  | RITMO1            |

## API (MVP)

Públicas:

```
POST /api/auth/registro   { nome, email, senha, perfil: 'paciente'|'psicologo' }
POST /api/auth/login      { email, senha } → { token, usuario }
```

Autenticadas (Bearer token, `/api`):

```
GET    /me                                        → perfil + código/vínculo
GET    /atividades                                → lista (filtros: status, data)
POST   /atividades                                → cria
GET    /atividades/:id                            → busca
PUT    /atividades/:id                            → atualização parcial
DELETE /atividades/:id                            → exclui
PATCH  /atividades/:id/concluir                   → conclui/reabre
GET    /rotina/hoje?data=YYYY-MM-DD               → atividades do dia + progresso
GET    /progresso                                 → streak, melhor streak, badges
GET    /vinculo                                   → código (psi) ou psicólogo (paciente)
POST   /vinculo        { codigo }                 → paciente se vincula
GET    /pacientes                                 → pacientes + resumo (psi)
GET    /pacientes/:id/resumo                      → hoje, atrasadas, 7 dias (psi)
GET    /pacientes/:id/rotina?data=YYYY-MM-DD      → rotina do paciente (psi)
```

Validações: campos obrigatórios e enums (prioridade, complexidade, perfil)
são rejeitados com `400`; recurso inexistente → `404`; sem sessão → `401`;
perfil errado → `403`. Mensagens sempre previsíveis em `{ mensagem }`.

Contratos legados de tarefas (`/cadastrarTarefa`, `GET /:id`, etc.) continuam
montados em `/` para compatibilidade, mas não são usados pelo produto.

## Gamificação (regra clara)

- Um dia conta para a **sequência** quando o paciente concluiu pelo menos uma
  atividade planejada naquele dia (prazo = dia).
- Conquistas: Primeiro passo (1 dia), 7 dias, 1 mês, 6 meses, 1 ano — baseadas
  na melhor sequência histórica, com progresso visível.
- Linguagem motivadora: nunca de punição.

## Frontend

Páginas: login, cadastro com escolha de perfil, **Home do paciente** ("O que
preciso fazer hoje?" — progresso, atividades por horário, consistência,
vínculo) e **Home do psicólogo** (código de vínculo, pacientes, rotina
individual com últimos 7 dias).

Acessibilidade: labels reais, foco visível, teclado, contraste AA,
`aria-*`, áreas clicáveis adequadas. Responsivo: mobile, tablet e desktop.
Estados de loading (skeleton), vazio e erro em todas as telas.
