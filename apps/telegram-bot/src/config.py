from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    BOT_TOKEN: str = "0:test"
    BOT_USERNAME: str = "moulinex_bot"
    WEBAPP_URL: str = "https://google.com"
    API_URL: str = "https://moulinexapi-production.up.railway.app"
    API_KEY: str = "mykey123"  # <--- تأكد أن هذا السطر موجود
    ENV: str = "development"

settings = Settings()
