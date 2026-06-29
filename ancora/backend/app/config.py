from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Konfiguracija učitana iz .env (ili process env)."""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/ancora"
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7    # 7 dana
    VERIFY_TOKEN_EXPIRE_MINUTES: int = 60 * 24        # 24h za potvrdu emaila
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # URL frontenda — za link u verifikacionom emailu
    FRONTEND_URL: str = "http://localhost:5173"

    # SMTP (Gmail). Ako prazno → link se ispisuje u konzolu (dev fallback).
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "Ancora <no-reply@ancora.app>"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
