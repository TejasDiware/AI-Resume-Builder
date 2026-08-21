FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=0

WORKDIR /app

# System libraries required by PDF/DOCX/ML dependencies
# and Chromium rendering.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libglib2.0-0 \
        libgl1 \
        libgomp1 \
        chromium \
        chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]