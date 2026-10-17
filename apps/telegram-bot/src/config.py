from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    BOT_TOKEN: str = "0:test"
    BOT_USERNAME: str = "moulinex_bot"
    WEBAPP_URL: str = "http://localhost:3000/tg"
    API_URL: str = "http://localhost:3001"
    API_KEY: str = "dev-internal-key-shared-with-bot-change-me"
    ENV: str = "development"


settings = Settings()
