from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from app.config import settings


def _get_candidate_models() -> list[str]:
    raw_fallbacks = settings.GOOGLE_MODEL_FALLBACKS.split(",")
    fallbacks = [model.strip() for model in raw_fallbacks if model.strip()]
    # Remove duplicados preservando ordem
    candidates = [settings.GOOGLE_MODEL, *fallbacks]
    seen = set()
    unique_models = []
    for model in candidates:
        if model not in seen:
            unique_models.append(model)
            seen.add(model)
    return unique_models


def _create_agent_executor(model_name: str):
    """Factory function para criar o agent executor com validação"""
    # Valida a chave da API
    if not settings.GOOGLE_API_KEY:
        raise RuntimeError(
            "GOOGLE_API_KEY não está configurada. "
            "Verifique seu arquivo .env ou variáveis de ambiente."
        )
    
    # Conecta ao banco SQLite
    try:
        db = SQLDatabase.from_uri(settings.DATABASE_URL)
    except Exception as e:
        raise RuntimeError(f"Erro ao conectar ao banco de dados: {str(e)}")
    
    # Configura o Gemini com o modelo recebido
    llm = ChatGoogleGenerativeAI(
        model=model_name,
        temperature=0,
        api_key=settings.GOOGLE_API_KEY
    )
    
    # Cria o executor do agente SQL
    agent_executor = create_sql_agent(
        llm,
        db=db,
        agent_type="openai-tools",
        verbose=False
    )
    
    return agent_executor


_agent_executors: dict[str, object] = {}


def _get_agent_executor(model_name: str):
    if model_name not in _agent_executors:
        _agent_executors[model_name] = _create_agent_executor(model_name)
    return _agent_executors[model_name]


def _is_model_unavailable(error_message: str) -> bool:
    upper_message = error_message.upper()
    return "503" in upper_message or "UNAVAILABLE" in upper_message


def _is_rate_limited(error_message: str) -> bool:
    upper_message = error_message.upper()
    return "429" in upper_message or "RESOURCE_EXHAUSTED" in upper_message or "RATE LIMIT" in upper_message


async def ask_with_model_fallback(question: str):
    candidate_models = _get_candidate_models()
    errors: list[str] = []

    for model_name in candidate_models:
        try:
            executor = _get_agent_executor(model_name)
            return await executor.ainvoke({"input": question})
        except Exception as e:
            message = str(e)

            # Em rate limit, tenta o proximo modelo apenas uma vez (sem retries).
            if _is_rate_limited(message):
                errors.append(f"{model_name}: {message}")
                continue

            # Fallback apenas para indisponibilidade temporaria do modelo.
            if _is_model_unavailable(message):
                errors.append(f"{model_name}: {message}")
                continue

            # Outros erros nao devem disparar cascata de tentativas.
            raise

    joined_errors = " | ".join(errors)
    raise RuntimeError(f"Todos os modelos falharam. Detalhes: {joined_errors}")


