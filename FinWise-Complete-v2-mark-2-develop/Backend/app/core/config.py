from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Finance Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "finwise-dev-secret-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./finance_app.db"

    # ── Ollama CLOUD — hosted by Ollama.com (DEFAULT / recommended) ──────────
    # Get API key: https://ollama.com/settings/keys
    # Cloud models: llama3.3:70b-cloud, deepseek-v3.1:671b-cloud, gemma3:27b-cloud
    OLLAMA_CLOUD_ENABLED: bool = False
    OLLAMA_API_KEY: str | None = None
    OLLAMA_CLOUD_MODEL: str = "llama3.3:70b-cloud"

    # ── Ollama LOCAL — runs on your own machine, no API key needed ───────────
    # Install: https://ollama.com  |  Pull model: ollama pull llama3.2
    OLLAMA_ENABLED: bool = False
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # ── Other cloud LLM providers ─────────────────────────────────────────────
    GROQ_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    HF_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
