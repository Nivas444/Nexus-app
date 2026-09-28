import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from sqlalchemy.engine import URL

# Root directory of the project where .env lives
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = BASE_DIR / ".env"
BACKEND_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus ERP - Master Expenses API"
    API_V1_STR: str = "/api/v1"
    
    # Database configuration matching .env keys
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=5432)
    DB_NAME: str = Field(default="Nexus_Master DB")
    DB_USER: str = Field(default="postgres")
    DB_PASSWORD: str = Field(default="")
    
    # CORS configuration for frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5500",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080",
        "null"
    ]
    
    @property
    def sqlalchemy_database_uri(self) -> URL:
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME
        )

    model_config = SettingsConfigDict(
        env_file=(
            str(ENV_FILE) if ENV_FILE.exists()
            else (str(BACKEND_ENV_FILE) if BACKEND_ENV_FILE.exists() else ".env")
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
