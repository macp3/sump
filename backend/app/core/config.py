from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "SUMP - Romantic Couple App"
    API_V1_STR: str = "/api"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./sump.db"
    
    # Relationship configuration
    RELATIONSHIP_START_DATE: str = "2024-01-01"
    
    # User 1 configuration
    USER1_USERNAME: str = "maciej"
    USER1_DISPLAY_NAME: str = "Maciej"
    USER1_INITIAL_PASSWORD: str = "Maciej123!"
    
    # User 2 configuration
    USER2_USERNAME: str = "selina"
    USER2_DISPLAY_NAME: str = "Selina"
    USER2_INITIAL_PASSWORD: str = "Selina123!"
    
    # CORS Origins (accepts comma separated string or list)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
