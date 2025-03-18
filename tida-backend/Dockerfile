FROM python:3.11-slim

WORKDIR /app

# Python ortamını ayarla
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Sistem bağımlılıklarını kur
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev netcat-traditional \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Gereksinimleri kopyala ve kur
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Uygulama dosyalarını kopyala
COPY . .

# Statik dosyaları topla
RUN python manage.py collectstatic --noinput

# Başlangıç scriptini kopyala ve çalıştırılabilir yap
COPY ./entrypoint.sh .
RUN chmod +x /app/entrypoint.sh

# WSGI sunucusunu başlat
ENTRYPOINT ["/app/entrypoint.sh"]