from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_DEV_SECRET = "dev-secret-change-me"

# Fallback used when CORS_ORIGINS is not set in the environment / .env.
# Exact matches only: scheme + host + port, no trailing slash, no wildcards.
DEFAULT_CORS_ORIGINS = ",".join(
    [
        "https://energygrappling.com",
        "https://www.energygrappling.com",
        "http://localhost:3000",  # vite dev server
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # vite's own default, if the port is ever changed back
        "http://127.0.0.1:5173",
        "http://localhost:8000",  # the API's own origin (Swagger UI at /docs)
        "http://127.0.0.1:8000",
    ]
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    jwt_secret: str = DEFAULT_DEV_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "sqlite:///./app.db"
    cors_origins: str = DEFAULT_CORS_ORIGINS

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()

if settings.is_production and settings.jwt_secret == DEFAULT_DEV_SECRET:
    # Refuse to boot rather than sign real tokens with a secret that is in the repo.
    raise RuntimeError(
        "JWT_SECRET is still the development default. Set a random value in .env "
        "(python -c \"import secrets; print(secrets.token_urlsafe(48))\")."
    )
