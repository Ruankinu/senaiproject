# 📋 Descrição Completa do Projeto — Para a Nova IA de Frontend

> **ATUALIZAÇÃO:** o frontend do RITHMO **já foi implementado** (React + Vite +
> TypeScript, em `frontend/`). Este documento foi o contexto de transferência
> usado para construí-lo; ele permanece como referência do contrato da API e do
> estado do repositório na época em que foi gerado. Para o estado atual, veja o
> `README.md` e o código em `frontend/`.

> Documento gerado para transferência de contexto. Descreve o estado atual do repositório `Ruankinu/senaiproject` (branch `main` / `arena/01a058a5-senaiproject`), o contrato da API e tudo o que o novo frontend precisa implementar.

---

## 1. ESTADO ATUAL DO PROJETO (IMPORTANTE — LER PRIMEIRO)

**O repositório contém APENAS o backend. Não existe frontend implementado.**
Não há nenhuma página, componente, HTML, JSX/TSX, CSS, framework de UI ou build de frontend no código.

Arquivos existentes (5, todos `.js`):

| Arquivo | Função |
|---|---|
| `server.js` | Sobe o servidor Express na **porta 3000**; habilita `express.json()` e `cors()` |
| `routes/Routes.js` | Define as rotas da API e conecta ao controller |
| `controllers/ControllerTarefa.js` | Lógica de negócio (CRUD completo) — 411 linhas |
| `models/Tarefa.js` | Classe `Tarefa` (entidade do domínio) |
| `db/jsonStore.js` | Persistência JSON local (data/*.json) |

**O que NÃO existe no repositório:**
- ❌ Frontend (nenhuma tela/página)
- ❌ `package.json` (nem do backend nem de frontend — dependências não estão declaradas)
- ❌ Script SQL de criação da tabela `tarefas`
- ❌ README, `.gitignore`, envs de configuração
- ❌ Testes

**Conclusão para a nova IA:** o frontend será criado do zero. Não há código antigo para manter compatibilidade visual — apenas a API abaixo precisa ser consumida exatamente como está (não alterar os contratos/rotas sem combinar com o backend, ou o front quebra).

---

## 2. TECNOLOGIA DO BACKEND (contexto)

- **Node.js** + **Express**
- **Persistência JSON** (arquivos em `data/` via `db/jsonStore.js`) — sem MySQL/SQLite
- **cors** habilitado globalmente (aceita qualquer origem — o front pode consumir sem problemas)
- JSON via `express.json()`
- Servidor escuta em **porta 3000** (`http://localhost:3000`)

---

## 3. MODELO DE DADOS — Tabela `tarefas`

| Campo | Tipo (inferido) | Regras |
|---|---|---|
| `id` | int | PK, auto increment |
| `titulo` | string | **obrigatório** no cadastro |
| `tarefa` | string | **obrigatório** no cadastro (descrição) |
| `prazo` | string/data | **obrigatório** no cadastro |
| `prioridade` | string | padrão `'Média'` se não enviado |
| `status` | string | inicial `'Pendente'`; vira `'Concluída'` |
| `criado_em` | timestamp | preenchido pelo banco (default) |

**Valores típicos:**
- `prioridade`: provavelmente `Baixa` / `Média` / `Alta` (o backend aceita qualquer string; default `Média`).
- `status`: `Pendente` ou `Concluída` (o backend não valida outros valores).

---

## 4. CONTRATO DA API (o que o front DEVE consumir)

Base URL: `http://localhost:3000` (em produção, trocar pela URL real).

### 4.1 `POST /cadastrarTarefa` — Criar tarefa
**Body (JSON):**
```json
{
  "titulo": "Comprar material",
  "tarefa": "Comprar cadernos e canetas",
  "prazo": "2026-09-05",
  "prioridade": "Alta"
}
```
- `titulo`, `tarefa`, `prazo` são obrigatórios → se faltar, responde **400**:
  `{ "mensagem": "Título, tarefa e prazo são obrigatórios." }`
- `prioridade` opcional (default `'Média'`).
- Sucesso → **201**:
```json
{
  "mensagem": "Tarefa cadastrada com sucesso",
  "tarefa": { "id": 1, "titulo": "...", "tarefa": "...", "prazo": "...", "prioridade": "Alta", "status": "Pendente" }
}
```
- Erro de banco → **500** `{ "mensagem": "Erro ao cadastrar tarefa." }`.

### 4.2 `GET /` — Listar todas as tarefas
- Sem parâmetros. Retorna **200**:
```json
{
  "quantidade": 2,
  "tarefas": [
    {
      "id": 1,
      "titulo": "...",
      "tarefa": "...",
      "prazo": "2026-09-05",
      "prioridade": "Alta",
      "status": "Pendente",
      "criado_em": "2026-08-31T...Z"
    }
  ]
}
```
- ⚠️ **Já vem ordenado por `prazo` ASC** (mais próximo primeiro). O front não precisa ordenar.

### 4.3 `GET /:id` — Buscar uma tarefa
- `id` deve ser número; inválido → **400** `{ "mensagem": "ID da tarefa inválido." }`
- Não encontrada → **404** `{ "mensagem": "Tarefa não encontrada." }`
- Sucesso → **200**:
```json
{ "tarefa": { "id": 1, "titulo": "...", "tarefa": "...", "prazo": "...", "prioridade": "...", "status": "...", "criado_em": "..." } }
```

### 4.4 `PUT /:id` — Editar tarefa (atualização parcial)
- Envia no body **apenas os campos que quer alterar** (pode ser 1 ou todos): `titulo`, `tarefa`, `prazo`, `prioridade`, `status`.
- Se nenhum campo for enviado → **400** `{ "mensagem": "Nenhum dado foi enviado para atualização." }`
- `id` inválido → **400**; não encontrada → **404**.
- Sucesso → **200**:
```json
{ "mensagem": "Tarefa atualizada com sucesso", "tarefa": { ...dados completos... } }
```

### 4.5 `DELETE /:id` — Excluir tarefa
- `id` inválido → **400**; não encontrada → **404**.
- Sucesso → **200** `{ "mensagem": "Tarefa excluída com sucesso." }`

### 4.6 `PATCH /:id/concluir` — Marcar como concluída
- Não precisa de body; o backend força `status = 'Concluída'`.
- `id` inválido → **400**; não encontrada → **404**.
- Sucesso → **200**:
```json
{ "mensagem": "Tarefa concluída com sucesso", "tarefa": { ...status: "Concluída"... } }
```

---

## 5. PÁGINAS/TELAS QUE O FRONTEND DEVE TER

Como a API é de CRUD de tarefas, o frontend deve contemplar estes fluxos (a quantidade exata de páginas pode ser adaptada, mas os fluxos são esses):

### Tela 1 — Home / Lista de Tarefas (GET `/`)
- Mostra todas as tarefas em **ordem de prazo** (a API já entrega ordenada).
- Cada item exibe: título, descrição, prazo, prioridade e status.
- Ações por tarefa:
  - ✅ Concluir (PATCH `/id/concluir`) — com feedback visual (ex.: riscado/tag "Concluída").
  - ✏️ Editar (navega para tela de edição ou abre modal) — PUT `/id`.
  - 🗑️ Excluir (com confirmação) — DELETE `/id`.
- Botão "Nova Tarefa" → tela de cadastro.
- Exibição de estado vazio ("Nenhuma tarefa cadastrada") e loading/erro.

### Tela 2 — Cadastro de Tarefa (POST `/cadastrarTarefa`)
- Formulário com campos: `titulo` (obrigatório), `tarefa` (obrigatório), `prazo` (obrigatório), `prioridade` (select: Baixa/Média/Alta; default `Média`).
- Validação no cliente antes de enviar + exibir mensagens de erro da API.
- Após sucesso: redirecionar para a Home (ou exibir sucesso e limpar formulário).

### Tela 3 — Detalhe da Tarefa (GET `/:id`) *(opcional, se quiser visual detalhado)*
- Exibe todos os campos, incluindo `criado_em`.
- Botões: Editar / Concluir / Excluir / Voltar.
- Tratar 404 ("Tarefa não encontrada").

### Tela 4 — Edição de Tarefa (PUT `/:id`)
- Formulário pré-preenchido com os dados atuais (buscar com GET `/:id`).
- Permite alterar qualquer campo, inclusive `status`.
- Enviar apenas os campos alterados (a API aceita atualização parcial).
- Após sucesso: voltar para a Home/Detalhe com feedback.

### Fluxos transversais (em qualquer tela):
- Tratamento de **erros 400/404/500** com mensagens amigáveis.
- Estados de **carregamento** e **vazio**.
- Formatação de `prazo` (ex.: `05/09/2026`) e identificação visual de **prioridade** (cores: Alta=vermelho, Média=amarelo/laranja, Baixa=verde) e **status** (Pendente/Concluída).

---

## 6. COMO O FRONT DEVE SE CONECTAR

1. **Base URL**: `http://localhost:3000` em dev (o backend já tem CORS liberado para qualquer origem).
2. **Formato**: JSON de entrada e saída, `Content-Type: application/json` nas requisições com body.
3. **Não há autenticação** — nenhum token/header é exigido.
4. **IDs** vêm como `number` — usar o `id` da resposta do POST para navegar/atualizar.
5. Se o front for servido em outra porta (ex.: Vite 5173), basta apontar `fetch`/`axios` para `http://localhost:3000` — o CORS já permite. Em produção, usar variável de ambiente para a URL da API (não hardcodar).

---

## 7. PENDÊNCIAS/CONFIRMAÇÕES QUE A NOVA IA DEVE CONSIDERAR

- **`package.json` não existe** → é preciso criar para o projeto (tanto backend quanto frontend).
- **Tabela `tarefas` não tem script SQL no repo** → a base precisa ser criada manualmente; o front deve assumir o modelo da seção 3.
- **Sem design system / logo / identidade visual definida** no repositório. Nome do app nos logs: **"RITHMO"**.
- **Sem requisitos de design** (dark/light, responsividade, mobile-first) → a nova IA deve definir ou perguntar.

---

## 8. RESUMO PARA A NOVA IA (versão curta)

> Crie um frontend do zero para uma API Express de gerenciamento de tarefas (persistência JSON, sem MySQL). A API roda em `http://localhost:3000`, usa JSON e aceita CORS de qualquer origem. Rotas: `POST /cadastrarTarefa` (criar), `GET /` (listar, já ordenada por prazo), `GET /:id` (detalhe), `PUT /:id` (edição parcial), `DELETE /:id` (excluir), `PATCH /:id/concluir` (concluir). Campos: `titulo`, `tarefa`, `prazo`, `prioridade` (default `Média`), `status` (`Pendente`/`Concluída`), `criado_em`. Telas: lista de tarefas, cadastro, detalhe (opcional) e edição, com validação, loading, estado vazio, feedback de erro/sucesso e cores por prioridade/status. Não há frontend, package.json, README nem script SQL no repositório — tudo será criado do zero.
