# 🛍️ Sistema de Compras Online + Agente Text-to-SQL

Sistema de e-commerce com catálogo de produtos, histórico de vendas e um agente de IA (**LangChain + Gemini**) para consultas em linguagem natural.

---

## 🧰 Stack Principal

- **Backend:** FastAPI + SQLAlchemy + SQLite  
- **Frontend:** React 18 + Vite  
- **IA:** LangChain + Google Gemini  

---

## 📋 Índice

- Visão Geral  
- Arquitetura  
- Pré-requisitos  
- Como Executar  
- Variáveis de Ambiente  
- Endpoints  
- Como Usar o Agente de IA  
- Troubleshooting  

---

## 🎯 Visão Geral

### Capacidades principais:

- 📦 CRUD de produtos  
- 🔍 Busca por nome ou categoria  
- 📊 Detalhes completos do produto:
  - Média de avaliação  
  - Histórico de vendas  
  - Avaliações de clientes  
- 🤖 Endpoint de IA (`/ask`) para perguntas de negócio  

---

## 🏗️ Arquitetura

### 🔙 Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py            # Endpoints FastAPI
│   ├── agent.py           # Agente Text-to-SQL (LangChain + Gemini)
│   ├── config.py          # Variáveis de ambiente
│   ├── database.py        # Setup SQLAlchemy
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

---

### 🎨 Frontend

```
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

## 📦 Pré-requisitos

- Python 3.12+
- Node.js 16+
- npm

---

## 🚀 Como Executar

### 1️⃣ Backend

```bash
# ativar ambiente virtual
.\desafio_venv\Scripts\Activate.ps1

cd backend
pip install -r requirements.txt

# popular banco
python seed.py

# rodar API
python -m uvicorn app.main:app --reload
```

Acesse:

* API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse:

* App: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🔐 Variáveis de Ambiente

Crie `backend/.env`:

```env
GOOGLE_API_KEY=sua_chave_aqui
GOOGLE_MODEL=gemini-2.5-flash
GOOGLE_MODEL_FALLBACKS=gemini-2.0-flash,gemini-2.0-flash-lite
# opcional
# DATABASE_URL=sqlite:///./banco.db
```

### ⚠️ Observações

* O sistema usa fallback automático de modelos Gemini
* Pode retornar:

  * `429` → quota excedida
  * `503` → modelo indisponível

---

## 🔌 Endpoints

### 🟢 Health Check

```
GET /
```

```json
{
  "status": "ok",
  "message": "API rodando com sucesso!"
}
```

---

### 📦 Produtos

```
GET    /products
GET    /products?search=termo
GET    /products/{product_id}
POST   /products
PUT    /products/{product_id}
DELETE /products/{product_id}
```

📌 **Observação:**
O DELETE retorna `200` com JSON de confirmação (não 204).

---

### 🤖 IA (Text-to-SQL)

```
GET /ask?question=Qual a receita total por categoria?
```

#### ✅ Resposta:

```json
{
  "pergunta": "Qual a receita total por categoria?",
  "resposta": "Resumo gerado pelo agente...",
  "sucesso": true
}
```

#### ⚠️ Possíveis erros:

* `400` → pergunta vazia
* `429` → quota excedida
* `503` → modelo indisponível
* `500` → erro interno

---

## 🧠 Como Usar o Agente de IA

### 💡 Exemplos de perguntas:

* Quais são os 10 produtos mais vendidos?
* Qual a receita total por categoria?
* Quais estados têm maior ticket médio?
* Quais categorias têm mais avaliações negativas?

---

### 🔄 Fluxo

1. Cliente chama `/ask` com uma pergunta
2. O agente gera SQL automaticamente
3. Executa no SQLite
4. Retorna uma resposta textual consolidada

---

## 🔧 Troubleshooting

### ❌ No module named app

➡️ Execute dentro da pasta correta:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

---

### ❌ No module named langchain_google_genai

```bash
.\desafio_venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
```

---

### ❌ Erro 429 (quota)

* Aguarde o tempo indicado
* Tente novamente depois
* Use outra chave com quota

---

### ❌ Erro 503 (modelo)

* Tente novamente em alguns segundos
* Verifique fallback configurado

---

### ❌ Frontend não conecta

Verifique:

* Backend → `127.0.0.1:8000`
* Frontend → `127.0.0.1:5173`

---

## 📝 Notas Finais

Este projeto demonstra a evolução de um CRUD tradicional para uma solução de **analytics conversacional com IA**, mantendo:

* API REST clara
* Frontend simples e funcional
* Camada de inteligência desacoplada

---

**Visagio | Rocket Lab 2026**
Desenvolvido por **Maria Eduarda Soares Machado** 🚀
