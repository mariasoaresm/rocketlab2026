import re
import unicodedata

from sqlalchemy import text
from sqlalchemy.orm import Session


def _normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    without_accents = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return without_accents.lower().strip()


def _extract_limit(question_normalized: str, default: int, max_limit: int = 50) -> int:
    top_match = re.search(r"\btop\s*(\d+)\b", question_normalized)
    if top_match:
        return max(1, min(int(top_match.group(1)), max_limit))

    count_match = re.search(r"\b(\d+)\s*(categorias|produtos)\b", question_normalized)
    if count_match:
        return max(1, min(int(count_match.group(1)), max_limit))

    return default


def _format_currency(value: float | None) -> str:
    if value is None:
        return "R$ 0.00"
    return f"R$ {value:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")


def _answer_top_categories_by_revenue(db: Session, question_normalized: str) -> str:
    limit = _extract_limit(question_normalized, default=5)
    rows = db.execute(
        text(
            """
            SELECT
                p.categoria_produto AS categoria,
                SUM(i."preco_BRL") AS receita_total
            FROM fat_itens_pedidos i
            JOIN dim_produtos p ON p.id_produto = i.id_produto
            GROUP BY p.categoria_produto
            ORDER BY receita_total DESC
            LIMIT :limit
            """
        ),
        {"limit": limit},
    ).mappings().all()

    if not rows:
        return "Nao encontrei dados para calcular receita por categoria."

    lines = [f"Top {limit} categorias por receita:"]
    for index, row in enumerate(rows, start=1):
        lines.append(f"{index}. {row['categoria']}: {_format_currency(row['receita_total'])}")
    return "\n".join(lines)


def _answer_top_products(db: Session, question_normalized: str) -> str:
    limit = _extract_limit(question_normalized, default=10)
    rows = db.execute(
        text(
            """
            SELECT
                p.nome_produto AS produto,
                COUNT(*) AS qtd_vendas,
                SUM(i."preco_BRL") AS receita_total
            FROM fat_itens_pedidos i
            JOIN dim_produtos p ON p.id_produto = i.id_produto
            GROUP BY p.id_produto, p.nome_produto
            ORDER BY qtd_vendas DESC, receita_total DESC
            LIMIT :limit
            """
        ),
        {"limit": limit},
    ).mappings().all()

    if not rows:
        return "Nao encontrei dados para calcular produtos mais vendidos."

    lines = [f"Top {limit} produtos mais vendidos:"]
    for index, row in enumerate(rows, start=1):
        lines.append(
            f"{index}. {row['produto']} - {row['qtd_vendas']} vendas - {_format_currency(row['receita_total'])}"
        )
    return "\n".join(lines)


def _answer_revenue_by_category(db: Session) -> str:
    rows = db.execute(
        text(
            """
            SELECT
                p.categoria_produto AS categoria,
                SUM(i."preco_BRL") AS receita_total
            FROM fat_itens_pedidos i
            JOIN dim_produtos p ON p.id_produto = i.id_produto
            GROUP BY p.categoria_produto
            ORDER BY receita_total DESC
            """
        )
    ).mappings().all()

    if not rows:
        return "Nao encontrei dados para calcular receita por categoria."

    lines = ["Receita total por categoria:"]
    for row in rows[:15]:
        lines.append(f"- {row['categoria']}: {_format_currency(row['receita_total'])}")
    return "\n".join(lines)


def _answer_orders_by_status(db: Session) -> str:
    rows = db.execute(
        text(
            """
            SELECT status, COUNT(*) AS total_pedidos
            FROM fat_pedidos
            GROUP BY status
            ORDER BY total_pedidos DESC
            """
        )
    ).mappings().all()

    if not rows:
        return "Nao encontrei pedidos para consolidar por status."

    lines = ["Quantidade de pedidos por status:"]
    for row in rows:
        lines.append(f"- {row['status']}: {row['total_pedidos']}")
    return "\n".join(lines)


def _answer_avg_ticket_by_state(db: Session, question_normalized: str) -> str:
    limit = _extract_limit(question_normalized, default=10)
    rows = db.execute(
        text(
            """
            SELECT
                v.estado AS estado,
                AVG(i."preco_BRL" + i.preco_frete) AS ticket_medio,
                COUNT(*) AS total_itens
            FROM fat_itens_pedidos i
            JOIN dim_vendedores v ON v.id_vendedor = i.id_vendedor
            GROUP BY v.estado
            ORDER BY ticket_medio DESC
            LIMIT :limit
            """
        ),
        {"limit": limit},
    ).mappings().all()

    if not rows:
        return "Nao encontrei dados para calcular ticket medio por estado."

    lines = [f"Top {limit} estados por ticket medio:"]
    for index, row in enumerate(rows, start=1):
        lines.append(
            f"{index}. {row['estado']}: {_format_currency(row['ticket_medio'])} ({row['total_itens']} itens)"
        )
    return "\n".join(lines)


def answer_question_locally(question: str, db: Session) -> dict | None:
    normalized = _normalize(question)

    if "categoria" in normalized and "receita" in normalized and (
        "top" in normalized or "mais" in normalized or "maior" in normalized
    ):
        answer = _answer_top_categories_by_revenue(db, normalized)
    elif "produto" in normalized and (
        "mais vendido" in normalized or "mais vendidos" in normalized
    ):
        answer = _answer_top_products(db, normalized)
    elif "receita" in normalized and "categoria" in normalized:
        answer = _answer_revenue_by_category(db)
    elif "pedido" in normalized and "status" in normalized:
        answer = _answer_orders_by_status(db)
    elif "ticket medio" in normalized and "estado" in normalized:
        answer = _answer_avg_ticket_by_state(db, normalized)
    else:
        return None

    return {
        "pergunta": question,
        "resposta": answer,
        "sucesso": True,
        "fonte": "fallback_sql_local",
    }
