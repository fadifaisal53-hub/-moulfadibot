FROM python:3.12-slim
WORKDIR /app

RUN pip install --no-cache-dir --upgrade pip
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e . 2>/dev/null || \
    pip install --no-cache-dir aiogram pydantic-settings httpx redis structlog

COPY src/ ./src/

CMD ["python", "-m", "src.main"]
