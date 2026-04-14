# 🛍️ Sistema de Compras Online - RocketLab 2026

Um sistema completo de gerenciamento de produtos com mais de 10.000 itens, histórico de vendas e avaliações de clientes. Desenvolvido com Python (FastAPI) no backend e React no frontend.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Pré-requisitos](#pré-requisitos)
4. [Como Executar](#como-executar)
5. [Endpoints da API](#endpoints-da-api)
6. [Funcionalidades Frontend](#funcionalidades-frontend)
7. [Estrutura de Pastas](#estrutura-de-pastas)

---

## 🎯 Visão Geral

Este projeto foi construído para:
- **Expor dados** de 10.000+ produtos em uma API REST rápida e escalável
- **Calcular automaticamente** a média de avaliações de cada produto
- **Gerenciar produtos** com operações completas de CRUD (Create, Read, Update, Delete)
- **Interface intuitiva** para gerentes previsualizarem histórico de vendas e feedback de clientes

**Stack Tecnológico:**
- **Backend:** FastAPI (Python 3.12)
- **Frontend:** React 18 + Vite
- **Banco de Dados:** SQLite com SQLAlchemy ORM
- **HTTP Client:** Axios

---

## 🏗️ Arquitetura do Projeto

### Backend (FastAPI)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI com todos os endpoints
│   ├── config.py            # Configurações (strings de conexão)
│   ├── database.py          # Setup do banco de dados
│   └── models/
│       ├── __init__.py
│       ├── produto.py           # Tabela de produtos
│       ├── pedido.py            # Tabela de pedidos
│       ├── item_pedido.py       # Itens dentro de um pedido
│       ├── avaliacao_pedido.py  # Avaliações dos clientes
│       ├── consumidor.py        # Dados dos clientes
│       └── vendedor.py          # Dados dos vendedores
├── alembic/                 # Migrações do banco (versionamento)
├── seed.py                  # Script para popular BD com dados
├── requirements.txt         # Dependências Python
└── alembic.ini              # Configuração de migrações
```

**O que cada model representa:**

| Model | Descrição |
|-------|-----------|
| **Produto** | Artigo sendo vendido (nome, categoria, peso, dimensões) |
| **Pedido** | Compra feita por um consumidor |
| **ItemPedido** | Um produto dentro de um pedido (relaciona produto, pedido, vendedor, preço) |
| **AvaliacaoPedido** | Avaliação (estrelas 1-5) deixada pelo cliente |
| **Consumidor** | Dados quem comprou |
| **Vendedor** | Loja/fornecedor que vende o produto |

### Frontend (React + Vite)

```
frontend/
├── package.json             # Dependências Node.js
├── vite.config.js           # Config do Vite (dev server)
├── index.html               # HTML raiz + CSS inline
├── src/
│   ├── main.jsx             # Render da aplicação React
│   ├── App.jsx              # Componente raiz com state e lógica
│   └── components/
│       ├── ProductList.jsx       # Grade de produtos
│       ├── ProductDetail.jsx     # Modal com detalhes do produto
│       └── ProductFormModal.jsx  # Modal para criar/editar
└── node_modules/            # Dependências instaladas (./gitignore)
```

---

## 📦 Pré-requisitos

- **Python 3.12+** instalado
- **Node.js 16+** e **npm** instalados
- **SQLite** (já vem com Python)
- Porta **8000** disponível (backend)
- Porta **5173** disponível (frontend)

---

## 🚀 Como Executar

### 1️⃣ Preparar o Backend

#### A) Ativar o ambiente virtual

```powershell
# Windows PowerShell
C:\Users\medua\rocketlab\rocketlab2026\venv\Scripts\Activate.ps1

# Seu terminal deve mostrar (venv) agora
```

#### B) Instalar dependências

```powershell
cd backend
pip install -r requirements.txt
```

#### C) Popular o banco de dados (primeira vez)

```powershell
# Ainda dentro de backend/
python seed.py
```

Você verá:
```
✅ Tabelas criadas com sucesso
✅ Dados inseridos com sucesso: X registros
```

#### D) Iniciar o servidor FastAPI

```powershell
# Ainda dentro de backend/
python -m uvicorn app.main:app --reload
```

Saída esperada:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
```

**✅ Backend está rodando!** Acesse:
- API: http://127.0.0.1:8000
- Swagger UI (documentação interativa): http://127.0.0.1:8000/docs

---

### 2️⃣ Preparar o Frontend

#### A) Abrir novo terminal

```powershell
cd C:\Users\medua\rocketlab\rocketlab2026\frontend
```

#### B) Instalar dependências Node.js

```powershell
npm install
```

Você verá:
```
added 86 packages in 30s
```

#### C) Iniciar o servidor Vite

```powershell
npm run dev
```

Saída esperada:
```
VITE v5.4.21 ready in 669 ms
➜  Local:   http://127.0.0.1:5173/
```

**✅ Frontend está rodando!** Acesse:
- Aplicação: http://127.0.0.1:5173

---

### 3️⃣ Validar Tudo Junto

Seus dois terminais devem estar assim:

**Terminal 1 (Backend):**
```
(venv) PS C:\rocketlab\rocketlab2026\backend> python -m uvicorn app.main:app --reload
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 (Frontend):**
```
PS C:\rocketlab\rocketlab2026\frontend> npm run dev
➜  Local:   http://127.0.0.1:5173/
```

Abra seu navegador em: **http://127.0.0.1:5173**

Você deve ver:
1. 🔍 Barra de busca no topo
2. ➕ Botão "Novo Produto"
3. 📦 Grid com produtos carregados do banco

---

## 🔌 Endpoints da API

### GET - Listar Produtos

```bash
# Todos os produtos
GET http://127.0.0.1:8000/products

# Com busca por nome ou categoria
GET http://127.0.0.1:8000/products?search=eletrônico

# Exemplo de resposta
[
  {
    "id_produto": "uuid-123",
    "nome_produto": "Smart TV 55\"",
    "categoria_produto": "Eletrônicos",
    "peso_produto_gramas": 15000,
    ...
  }
]
```

### GET - Detalhes do Produto (com Avaliações)

```bash
GET http://127.0.0.1:8000/products/{id_produto}

# Exemplo de resposta
{
  "produto": {
    "id_produto": "uuid-123",
    "nome_produto": "Smart TV 55\"",
    ...
  },
  "media_avaliacao": 4.5,           # ⭐ Média calculada
  "total_avaliacoes": 250,
  "historico_vendas": [             # 📦 Quem comprou
    {
      "id_pedido": 1,
      "status_pedido": "Entregue",
      "data_compra": "2026-01-15T10:30:00",
      "preco_BRL": 2499.99,
      "vendedor": { ... }
    }
  ],
  "avaliacoes": [                   # ⭐ Feedbacks dos clientes
    {
      "avaliacao": 5,
      "titulo_comentario": "Excelente produto",
      "comentario": "Muito bom!",
      "data_comentario": "2026-01-20T08:00:00"
    }
  ]
}
```

### POST - Criar Produto

```bash
POST http://127.0.0.1:8000/products

# Body (form-encoded)
nome_produto=GeladeiragegaX
categoria_produto=Eletrodomésticos
peso_produto_gramas=80000
comprimento_centimetros=70
altura_centimetros=180
largura_centimetros=75
```

**Resposta:**
```json
{
  "id_produto": "novo-uuid-456",
  "nome_produto": "Geladeira X",
  ...
}
```

### PUT - Atualizar Produto

```bash
PUT http://127.0.0.1:8000/products/{id_produto}

# Atualiza apenas os campos fornecidos
nome_produto=Geladeira XL
categoria_produto=Eletrodomésticos Premium
```

### DELETE - Remover Produto

```bash
DELETE http://127.0.0.1:8000/products/{id_produto}

# Resposta: 204 No Content
```

---

## 💻 Funcionalidades Frontend

### 🔍 Busca em Tempo Real

- Digite na barra de busca para filtrar por **nome** ou **categoria**
- Pressione **Enter** para buscar
- A lista se atualiza automaticamente

### ➕ Adicionar Produto

1. Clique no botão **"Novo Produto"**
2. Preencha o formulário:
   - `Nome do Produto` (obrigatório)
   - `Categoria` (obrigatório)
   - Peso, Comprimento, Altura, Largura (opcional)
3. Clique **"Salvar"**
4. Mensagem de sucesso aparecerá no topo

### ✏️ Editar Produto

1. Clique no botão **✏️ Editar** em um produto
2. Modal abre com dados pré-preenchidos
3. Modifique os campos
4. Clique **"Atualizar"**

### 🗑️ Deletar Produto

1. Clique no botão **🗑️ Deletar** em um produto
2. Popup de confirmação aparece: *"Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."*
3. Clique **"OK"** para confirmar ou **"Cancelar"** para abortar
4. Produto é removido e lista é atualizada

### 👁️ Ver Detalhes Completos

1. Clique no **nome do produto** ou no link *"Ver Detalhes"*
2. Modal abre mostrando:
   - **Badge de Rating:** Cor baseada na avaliação média
     - 🟢 Verde (≥4.5) = Excelente
     - 🟡 Amarelo (≥3.5) = Bom
     - 🟠 Laranja (≥2.5) = Médio
     - 🔴 Vermelho (<2.5) = Ruim
   - **Dimensões:** Peso, comprimento, altura, largura
   - **Histórico de Vendas:** Quem comprou, quando, por qual preço, qual vendedor
   - **Avaliações:** Estrelas, comentários, datas de feedback

---

## 📁 Estrutura de Pastas

```
rocketlab2026/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 ⭐ Endpoints FastAPI
│   │   ├── config.py
│   │   ├── database.py
│   │   └── models/
│   │       ├── produto.py
│   │       ├── pedido.py
│   │       ├── item_pedido.py
│   │       ├── avaliacao_pedido.py
│   │       ├── consumidor.py
│   │       └── vendedor.py
│   ├── alembic/
│   ├── seed.py                     ⭐ População do BD
│   ├── requirements.txt
│   ├── alembic.ini
│   └── database.db                 (criado após seed.py)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                ⭐ Render React
│   │   ├── App.jsx                 ⭐ Componente raiz
│   │   └── components/
│   │       ├── ProductList.jsx     ⭐ Grid de produtos
│   │       ├── ProductDetail.jsx   ⭐ Modal de detalhes
│   │       └── ProductFormModal.jsx⭐ Modal de CRUD
│   ├── index.html                  ⭐ HTML + CSS
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/               (criado após npm install)
│
├── desafio_venv/                   (ambiente virtual Python)
│   ├── Scripts/
│   │   ├── python.exe
│   │   ├── activate.bat
│   │   ├── Activate.ps1
│   │   └── ...
│   └── Lib/site-packages/          (dependências Python)
│
└── README.md                        (este arquivo)
```

---

## 🔧 Troubleshooting

### ❌ "Network Error" ao carregar produtos

**Solução:** Backend não está rodando
```powershell
# Na pasta backend/, execute:
python -m uvicorn app.main:app --reload
```

### ❌ "Unexpected token" no console do navegador

**Solução:** Arquivo JSX foi editado durante a execução. O Vite recarrega automaticamente.
- Verifique erros de sintaxe
- Salve o arquivo novamente

### ❌ Porta 8000/5173 já está em uso

**Solução:** Mude a porta:

**Backend:**
```powershell
python -m uvicorn app.main:app --reload --port 8001
```

**Frontend:**
```powershell
# Edite frontend/vite.config.js
export default {
  server: {
    port: 5174
  }
}
```

### ❌ Dependências não instaladas

```powershell
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## 📈 Como Funciona a Arquitetura

### Fluxo de Dados

```
[Navegador do Gerente]
        ↓
[React App (Frontend) - Port 5173]
        ↓ (HTTP + Axios)
[FastAPI (Backend) - Port 8000]
        ↓ (SQLAlchemy ORM)
[SQLite Database]
```

### Exemplo: Buscar Produto com Avaliações

1. **Gerente digita** "iPhone" na barra de busca
2. **Frontend** faz `GET /products?search=iPhone`
3. **Backend recebe**, filtra na tabela Produto usando `.ilike('%iPhone%')`
4. **Backend retorna** lista de produtos
5. **Frontend exibe** em grid
6. **Gerente clica** em um produto
7. **Frontend faz** `GET /products/{id}`
8. **Backend executa query complexa:**
   - Busca o produto
   - Encontra todos os pedidos que venderam esse produto (subquery)
   - Calcula a **média de avaliações** com `func.avg(AvaliacaoPedido.avaliacao)`
   - Faz join com Vendedor para obter informações do lojista
   - Retorna tudo junto em um único JSON aninhado
9. **Frontend exibe** tudo em um modal bonito com badge colorido

---

## 🎓 Conceitos Implementados

### Backend

- **RESTful API:** Endpoints seguem padrão REST (GET, POST, PUT, DELETE)
- **ORM (SQLAlchemy):** Abstração de banco de dados sem SQL puro
- **Validação:** FastAPI valida automaticamente tipos de dados
- **Relacionamentos:** Modelos conectados (Produto → ItemPedido → Pedido, etc.)
- **Agregação:** Cálculo de média com `func.avg()` e subqueries

### Frontend

- **Hooks React:** `useState` para state, `useEffect` para ciclo de vida
- **Axios:** Cliente HTTP para comunicação com API
- **Components:** Componentes reutilizáveis (ProductList, ProductDetail, ProductFormModal)
- **State Management:** Centralizado em App.jsx, passado via props
- **Modal UI:** Componentes sobrepostos com overlay
- **Responsive Design:** Grid CSS que adapta em diferentes resoluções

---

## 📚 Recursos Úteis

- **FastAPI Docs:** http://127.0.0.1:8000/docs (Swagger UI interativo)
- **React Docs:** https://react.dev
- **SQLAlchemy ORM:** https://docs.sqlalchemy.org
- **Axios:** https://axios-http.com

---

## ✅ Checklist de Funcionalidades

- [x] API REST completa (GET, POST, PUT, DELETE)
- [x] Busca em tempo real com ?search=
- [x] Cálculo automático de média de avaliações
- [x] Grade responsiva de produtos
- [x] Modal de detalhes com histórico de vendas
- [x] Badges coloridas baseadas em rating
- [x] Formulário de criação de produtos
- [x] Formulário de edição de produtos
- [x] Deletar com confirmação
- [x] Mensagens de sucesso/erro
- [x] 10.000+ produtos carregados
- [x] Hot reload (Vite)
- [x] Design amigável para gerentes

---

## 📝 Notas Finais

Este sistema foi construído com foco em:

1. **Performance:** Queries otimizadas, indexes no banco
2. **User Experience:** Confirmações antes de deletar, badges coloridas, feedback visual
3. **Escalabilidade:** Arquitetura preparada para crescimento
4. **Manutenibilidade:** Código limpo, componentes isolados, documentação

Aproveite o sistema! 🚀
