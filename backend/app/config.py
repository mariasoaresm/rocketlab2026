from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os

# Carrega .env uma única vez
from dotenv import load_dotenv
load_dotenv()


class Settings(BaseSettings):
    # Caminho do banco na raiz da pasta backend
    DATABASE_URL: str = f"sqlite:///{Path(__file__).parent.parent}/banco.db"
    
    # Chave da API do Gemini
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    # Modelo Gemini utilizado pelo agente Text-to-SQL
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash")
    # Modelos alternativos em caso de indisponibilidade do modelo principal
    GOOGLE_MODEL_FALLBACKS: str = os.getenv(
        "GOOGLE_MODEL_FALLBACKS",
        "gemini-2.0-flash,gemini-2.0-flash-lite",
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def validate_on_init(self):
        """Valida se a chave do Gemini está configurada"""
        if not self.GOOGLE_API_KEY:
            raise ValueError(
                "GOOGLE_API_KEY não encontrada. "
                "Certifique-se de que está definida no arquivo .env ou nas variáveis de ambiente."
            )
        if not self.GOOGLE_MODEL:
            raise ValueError("GOOGLE_MODEL não pode ser vazio.")
        return self


settings = Settings().validate_on_init()
