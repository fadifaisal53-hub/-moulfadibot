FROM python:3.12-slim
WORKDIR /app

# تثبيت الحزم المطلوبة للبوت
RUN pip install --no-cache-dir aiogram pydantic-settings httpx redis structlog

# نسخ ملفات البوت
COPY apps/telegram-bot/src ./src
COPY apps/telegram-bot/pyproject.toml ./

# تشغيل البوت
CMD ["python", "-m", "src.main"]
