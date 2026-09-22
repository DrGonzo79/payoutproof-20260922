FROM python:3.12-slim
WORKDIR /app
COPY api/pyproject.toml api/uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev
COPY api/main.py ./main.py
COPY data ./data
EXPOSE 8000
CMD [".venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
