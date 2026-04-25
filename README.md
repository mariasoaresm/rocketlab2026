# Sistema de Compras Online + Agente Text-to-SQL

Sistema de e-commerce com catalogo de produtos, historico de vendas e um agente de IA (LangChain + Gemini) para consultas em linguagem natural.

Stack principal:
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: React 18 + Vite
- IA: LangChain + Google Gemini

---

## Indice
- Visao geral
- Arquitetura
- Pre-requisitos
- Como executar
- Variaveis de ambiente
- Endpoints
- Como usar o agente de IA
- Troubleshooting

---

## Visao Geral

Capacidades principais:
- CRUD de produtos
- Busca por nome/categoria
- Detalhes de produto com:
  - media de avaliacao
  - historico de vendas
  - avaliacoes
- Endpoint de IA (/ask) para perguntas de negocio em linguagem natural

---

## Arquitetura

### Backend

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py            # Endpoints FastAPI
│   ├── agent.py           # Agente Text-to-SQL (LangChain + Gemini)
│   ├── config.py          # Settings e variaveis de ambiente
│   ├── database.py        # Engine/session SQLAlchemy
│   └── models/
│       ├── produto.py
│       ├── pedido.py
│       ├── item_pedido.py
│       ├── avaliacao_pedido.py
│       ├── consumidor.py
│       └── vendedor.py
├── alembic/
├── seed.py
├── requirements.txt
├── banco.db
└── .env.example
```

### Frontend

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    └── components/
        ├── CrudSection.jsx
        ├── ProductList.jsx
        ├── ProductDetail.jsx
        └── ProductFormModal.jsx
```

---

## Pre-requisitos

- Python 3.12+
- Node.js 16+
- npm

---

## Como Executar

### 1) Backend

No Windows PowerShell:

```powershell
# na raiz do projeto
.\desafio_venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
python seed.py
python -m uvicorn app.main:app --reload
```

Acesse:
- API: http://127.0.0.1:8000
- Docs: http://127.0.0.1:8000/docs

### 2) Frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Acesse:
- App: http://127.0.0.1:5173

---

## Variaveis de Ambiente

Crie/edite `backend/.env` com:

```env
GOOGLE_API_KEY=sua_chave_aqui
GOOGLE_MODEL=gemini-2.5-flash
GOOGLE_MODEL_FALLBACKS=gemini-2.0-flash,gemini-2.0-flash-lite
# opcional, se quiser sobrescrever:
# DATABASE_URL=sqlite:///./banco.db
```

Observacoes:
- O projeto usa fallback de modelos Gemini automaticamente.
- Em caso de indisponibilidade/quota, o backend retorna status HTTP apropriado (429/503).

---

## Endpoints

### Health

```http
GET /
```

Resposta:

```json
{
  "status": "ok",
  "message": "API rodando com sucesso!"
}
```

### Produtos

```http
GET /products
GET /products?search=termo
GET /products/{product_id}
POST /products
PUT /products/{product_id}
DELETE /products/{product_id}
```

Observacao sobre DELETE:
- Retorna 200 com JSON de confirmacao, nao 204 vazio.

### IA (Text-to-SQL)

```http
GET /ask?question=Qual a receita total por categoria?
```

Resposta de sucesso:

```json
{
  "pergunta": "Qual a receita total por categoria?",
  "resposta": "...texto gerado pelo agente...",
  "sucesso": true
}
```

Possiveis erros:
- 400: pergunta vazia
- 429: quota da Gemini excedida (pode vir com `Retry-After`)
- 503: modelo temporariamente indisponivel
- 500: erro interno

---

## Como Usar o Agente de IA

Exemplos de perguntas:
- Quais sao os 10 produtos mais vendidos?
- Qual a receita total por categoria?
- Quais estados tem maior ticket medio?
- Quais categorias concentram mais avaliacoes negativas?

Fluxo:
1. Frontend ou cliente chama `/ask` com `question`.
2. O agente gera e executa consultas SQL no SQLite.
3. A API retorna a resposta textual consolidada em `resposta`.

---

## Troubleshooting

### No module named app

Causa comum: comando executado fora de `backend`.

Solucao:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

### No module named langchain_google_genai

Causa comum: dependencia nao instalada na venv ativa.

Solucao:

```powershell
.\desafio_venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
```

### Erro 429 no /ask

Causa: quota da Gemini excedida.

Solucao:
- aguarde o tempo informado na resposta
- tente novamente depois
- use chave/projeto com quota disponivel

### Erro 503 no /ask

Causa: indisponibilidade temporaria do modelo.

Solucao:
- tente novamente em alguns segundos
- manter `GOOGLE_MODEL_FALLBACKS` configurado

### Frontend sem conectar no backend

Verifique:
- backend rodando em 127.0.0.1:8000
- frontend rodando em 127.0.0.1:5173

---

## Notas Finais

Este projeto demonstra uma evolucao de CRUD para analytics conversacional com IA, mantendo uma API REST clara e um frontend simples para operacao do catalogo.
