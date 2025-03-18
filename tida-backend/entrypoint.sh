#!/bin/bash

# PostgreSQL'in hazır olmasını bekle
if [ "$DATABASE" = "postgres" ]
then
    echo "PostgreSQL başlaması bekleniyor..."
    
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 0.1
    done
    
    echo "PostgreSQL başladı"
fi

# Migration'ları çalıştır
python manage.py migrate

# Statik dosyaları temizle ve yeniden topla
echo "Statik dosyalar toplanıyor..."
python manage.py collectstatic --noinput --clear

# Gunicorn WSGI sunucusunu başlat
exec gunicorn tida_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120