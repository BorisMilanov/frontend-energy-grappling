from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_DEV_SECRET = "dev-secret-change-me"

# NOTE: the CORS allow-list lives in main.py (ALLOWED_ORIGINS), fixed in code on purpose.
# There is deliberately no CORS_ORIGINS setting here — see main.py.


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    jwt_secret: str = DEFAULT_DEV_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./app.db"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()

if settings.is_production and settings.jwt_secret == DEFAULT_DEV_SECRET:
    # Refuse to boot rather than sign real tokens with a secret that is in the repo.
    raise RuntimeError(
        "JWT_SECRET is still the development default. Set a random value in .env "
        "(python -c \"import secrets; print(secrets.token_urlsafe(48))\")."
    )
