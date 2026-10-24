import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

def load_env_variables():
    env_file = BASE_DIR / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k:
                    os.environ.setdefault(k, v)

load_env_variables()

DATA_DIR = BASE_DIR / "data_storage"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = os.getenv("SYNAPSE_DB_PATH", str(DATA_DIR / "synapse.db"))

class Settings(BaseModel):
    APP_NAME: str = "SYNAPSE Organizational Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    SYNAPSE_ENV: str = os.getenv("SYNAPSE_ENV", "development")
    DEFAULT_TENANT_ID: str = "tenant-artisan-corp-01"
    DATABASE_PATH: str = DATABASE_PATH
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SIMULATE_LLM_IF_NO_KEY: bool = True

    # Neo4j Aura Graph Database Settings
    NEO4J_URI: str = os.getenv("NEO4J_URI", "")
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "")
    NEO4J_DATABASE: str = os.getenv("NEO4J_DATABASE", "neo4j")

    @property
    def has_neo4j(self) -> bool:
        return bool(self.NEO4J_URI and self.NEO4J_PASSWORD)

settings = Settings()
