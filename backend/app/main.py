from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.agent import ask_with_model_fallback
from app import models
from app.database import get_db
from app.local_text_to_sql import answer_question_locally

app = FastAPI(
    title="Sistema de Compras Online",
    description="API para gerenciamento de pedidos, produtos, consumidores e vendedores.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract_upstream_status(error_message: str) -> int | None:
    upper_message = error_message.upper()
    if " 400 " in f" {upper_message} " or "INVALID_ARGUMENT" in upper_message:
        return 400
    if " 401 " in f" {upper_message} " or "UNAUTHENTICATED" in upper_message:
        return 401
    if " 403 " in f" {upper_message} " or "PERMISSION_DENIED" in upper_message:
        return 403
    if " 404 " in f" {upper_message} " or "NOT_FOUND" in upper_message:
        return 404
    if " 429 " in f" {upper_message} " or "RESOURCE_EXHAUSTED" in upper_message:
        return 429
    if " 503 " in f" {upper_message} " or "UNAVAILABLE" in upper_message:
        return 503
    return None


def _extract_retry_after_seconds(error_message: str) -> int | None:
    # Exemplo comum: "Please retry in 58.607878833s."
    match_retry = re.search(r"retry in\s+([0-9]+(?:\.[0-9]+)?)s", error_message, re.IGNORECASE)
    if match_retry:
        return max(1, int(float(match_retry.group(1))))

    # Exemplo do RetryInfo: '"retryDelay": "58s"'
    match_delay = re.search(r'"retryDelay"\s*:\s*"([0-9]+)s"', error_message, re.IGNORECASE)
    if match_delay:
        return max(1, int(match_delay.group(1)))

    return None


def _serialize_product(product: models.Produto) -> dict:
    return {
        "id_produto": product.id_produto,
        "nome_produto": product.nome_produto,
        "categoria_produto": product.categoria_produto,
        "peso_produto_gramas": product.peso_produto_gramas,
        "comprimento_centimetros": product.comprimento_centimetros,
        "altura_centimetros": product.altura_centimetros,
        "largura_centimetros": product.largura_centimetros,
    }


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "API rodando com sucesso!"}


@app.get("/products", tags=["Products"])
def list_products(search: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Produto)
    if search:
        query = query.filter(
            (models.Produto.nome_produto.ilike(f"%{search}%")) | 
            (models.Produto.categoria_produto.ilike(f"%{search}%"))
        )
    products = query.order_by(models.Produto.nome_produto).all()
    return [_serialize_product(product) for product in products]


@app.get("/products/{product_id}", tags=["Products"])
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    product = db.get(models.Produto, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    product_order_ids = (
        db.query(models.ItemPedido.id_pedido)
        .filter(models.ItemPedido.id_produto == product_id)
        .distinct()
        .subquery()
    )

    sales_history_rows = (
        db.query(models.ItemPedido, models.Pedido, models.Vendedor)
        .join(models.Pedido, models.Pedido.id_pedido == models.ItemPedido.id_pedido)
        .join(models.Vendedor, models.Vendedor.id_vendedor == models.ItemPedido.id_vendedor)
        .filter(models.ItemPedido.id_produto == product_id)
        .order_by(models.Pedido.pedido_compra_timestamp.desc())
        .all()
    )

    evaluations = (
        db.query(models.AvaliacaoPedido)
        .filter(models.AvaliacaoPedido.id_pedido.in_(product_order_ids))
        .order_by(models.AvaliacaoPedido.data_comentario.desc())
        .all()
    )

    average_rating = (
        db.query(func.avg(models.AvaliacaoPedido.avaliacao))
        .filter(models.AvaliacaoPedido.id_pedido.in_(product_order_ids))
        .scalar()
    )

    return {
        "produto": _serialize_product(product),
        "media_avaliacao": round(float(average_rating), 2) if average_rating is not None else None,
        "total_avaliacoes": len(evaluations),
        "historico_vendas": [
            {
                "id_pedido": pedido.id_pedido,
                "status_pedido": pedido.status,
                "id_consumidor": pedido.id_consumidor,
                "data_compra": pedido.pedido_compra_timestamp,
                "data_entrega": pedido.pedido_entregue_timestamp,
                "data_estimada_entrega": pedido.data_estimada_entrega,
                "tempo_entrega_dias": pedido.tempo_entrega_dias,
                "tempo_entrega_estimado_dias": pedido.tempo_entrega_estimado_dias,
                "diferenca_entrega_dias": pedido.diferenca_entrega_dias,
                "entrega_no_prazo": pedido.entrega_no_prazo,
                "id_item": item.id_item,
                "id_vendedor": item.id_vendedor,
                "preco_BRL": item.preco_BRL,
                "preco_frete": item.preco_frete,
                "vendedor": {
                    "id_vendedor": vendedor.id_vendedor,
                    "nome_vendedor": vendedor.nome_vendedor,
                    "cidade": vendedor.cidade,
                    "estado": vendedor.estado,
                },
            }
            for item, pedido, vendedor in sales_history_rows
        ],
        "avaliacoes": [
            {
                "id_avaliacao": avaliacao.id_avaliacao,
                "id_pedido": avaliacao.id_pedido,
                "avaliacao": avaliacao.avaliacao,
                "titulo_comentario": avaliacao.titulo_comentario,
                "comentario": avaliacao.comentario,
                "data_comentario": avaliacao.data_comentario,
                "data_resposta": avaliacao.data_resposta,
            }
            for avaliacao in evaluations
        ],
    }


@app.post("/products", tags=["Products"])
def create_product(
    nome_produto: str,
    categoria_produto: str,
    peso_produto_gramas: float = None,
    comprimento_centimetros: float = None,
    altura_centimetros: float = None,
    largura_centimetros: float = None,
    db: Session = Depends(get_db),
):
    import uuid
    product_id = str(uuid.uuid4())[:32]
    new_product = models.Produto(
        id_produto=product_id,
        nome_produto=nome_produto,
        categoria_produto=categoria_produto,
        peso_produto_gramas=peso_produto_gramas,
        comprimento_centimetros=comprimento_centimetros,
        altura_centimetros=altura_centimetros,
        largura_centimetros=largura_centimetros,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return _serialize_product(new_product)


@app.put("/products/{product_id}", tags=["Products"])
def update_product(
    product_id: str,
    nome_produto: str = None,
    categoria_produto: str = None,
    peso_produto_gramas: float = None,
    comprimento_centimetros: float = None,
    altura_centimetros: float = None,
    largura_centimetros: float = None,
    db: Session = Depends(get_db),
):
    product = db.get(models.Produto, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    if nome_produto is not None:
        product.nome_produto = nome_produto
    if categoria_produto is not None:
        product.categoria_produto = categoria_produto
    if peso_produto_gramas is not None:
        product.peso_produto_gramas = peso_produto_gramas
    if comprimento_centimetros is not None:
        product.comprimento_centimetros = comprimento_centimetros
    if altura_centimetros is not None:
        product.altura_centimetros = altura_centimetros
    if largura_centimetros is not None:
        product.largura_centimetros = largura_centimetros
    
    db.commit()
    db.refresh(product)
    return _serialize_product(product)


@app.delete("/products/{product_id}", tags=["Products"])
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.get(models.Produto, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    db.delete(product)
    db.commit()
    return {"message": "Produto deletado com sucesso", "id_produto": product_id}

@app.get("/ask", tags=["AI Agent"])
async def ask_ai(question: str, db: Session = Depends(get_db)):
    """
    Endpoint para realizar consultas em linguagem natural ao banco de dados.
    Exemplo: 'Quais são os 10 produtos mais vendidos?'
    """
    try:
        if not question or len(question.strip()) == 0:
            raise HTTPException(
                status_code=400, 
                detail="A pergunta não pode estar vazia"
            )
        
        # Usa fallback automatico entre modelos para aumentar disponibilidade.
        result = await ask_with_model_fallback(question)
        
        return {
            "pergunta": question,
            "resposta": result.get("output", ""),
            "sucesso": True
        }
    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e)
        mapped_status = _extract_upstream_status(error_message)
        if mapped_status is not None:
            local_response = answer_question_locally(question, db)
            if local_response is not None:
                return local_response

            headers = None
            detail_message = f"Erro no provedor LLM (status {mapped_status}): {error_message}"
            if mapped_status in (429, 503):
                retry_after = _extract_retry_after_seconds(error_message)
                if retry_after is not None:
                    headers = {"Retry-After": str(retry_after)}

            if mapped_status == 429:
                if headers and "Retry-After" in headers:
                    detail_message = (
                        "Quota da Gemini API excedida no momento. "
                        f"Tente novamente em aproximadamente {headers['Retry-After']}s "
                        "ou utilize uma chave/projeto com quota disponivel."
                    )
                else:
                    detail_message = (
                        "Quota da Gemini API excedida no momento. "
                        "Tente novamente em instantes ou utilize uma chave/projeto com quota disponivel."
                    )

            raise HTTPException(
                status_code=mapped_status,
                detail=detail_message,
                headers=headers,
            )
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar pergunta: {error_message}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
