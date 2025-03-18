# TIDA - Production Docker Kurulum Rehberi

Bu rehber, TIDA projesinin Docker kullanarak production ortamında nasıl kurulacağını açıklar.

## Ön Gereksinimler

- Docker ve Docker Compose kurulu olmalı
- Git kurulu olmalı
- Sunucu veya VPS (min. 2GB RAM, 2 CPU)

## Kurulum Adımları

1. **Proje dosyalarını düzenleyin**

   Aşağıdaki dosyaları projenin ilgili dizinlerine yerleştirin:
   
   - `docker-compose.yml` → Ana dizine
   - `tida-backend/Dockerfile` → Backend klasörüne
   - `tida-backend/entrypoint.sh` → Backend klasörüne
   - `tida-backend/requirements.txt` → Backend klasörüne (veya mevcut dosyayı güncelleyin)
   - `tida-frontend/Dockerfile` → Frontend klasörüne
   - `nginx/conf.d/default.conf` → nginx/conf.d klasörüne (klasörü oluşturun)
   - `.env` → Ana dizine

2. **Django settings.py dosyasını güncelleyin**

   `tida-backend/tida_backend/settings.py` dosyasını, verilen güncellemelerle düzenleyin.

3. **Frontend için nginx yapılandırması ekleyin**

   Frontend Dockerfile'ının çalışması için `/tida-frontend/nginx.conf` dosyasını oluşturun:

   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Klasör yapısını oluşturun**

   ```bash
   mkdir -p nginx/conf.d nginx/ssl
   ```

5. **Dosya izinlerini ayarlayın**

   ```bash
   chmod +x tida-backend/entrypoint.sh
   ```

6. **Docker Compose ile başlatın**

   ```bash
   docker-compose up -d
   ```

7. **Superuser oluşturun (İlk kez)**

   ```bash
   docker-compose exec backend python manage.py createsuperuser --noinput
   ```

## Production Ortamı Güvenlik Ayarları

1. **SSL/TLS Yapılandırması**

   Let's Encrypt ile SSL sertifikası alın ve nginx/ssl dizinine yerleştirin:

   ```bash
   # Certbot kurulumu (Ubuntu/Debian)
   apt-get update
   apt-get install certbot python3-certbot-nginx
   
   # Sertifika edinme
   certbot certonly --standalone -d tida.example.com
   
   # Sertifikaları kopyalama
   cp /etc/letsencrypt/live/tida.example.com/fullchain.pem nginx/ssl/tida.crt
   cp /etc/letsencrypt/live/tida.example.com/privkey.pem nginx/ssl/tida.key
   ```

   Daha sonra nginx yapılandırmasında SSL bölümünü aktifleştirin.

2. **Güvenli Ortam Değişkenleri**

   `.env` dosyasındaki tüm şifreleri ve SECRET_KEY değerini güncellemeyi unutmayın.

3. **Firewall Yapılandırması**

   ```bash
   # UFW örneği (Ubuntu)
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

4. **Düzenli Güncellemeler**

   Docker imajlarını ve sisteminizi düzenli olarak güncelleyin:

   ```bash
   # Docker imajlarını güncelleme
   docker-compose down
   docker-compose pull
   docker-compose up -d
   
   # Sistem güncellemesi
   apt-get update && apt-get upgrade
   ```

## Bakım ve İzleme

- **Log Kayıtları**:
  ```bash
  docker-compose logs -f [service_name]
  ```

- **Veritabanı Yedekleme**:
  ```bash
  docker-compose exec db pg_dump -U postgres tida > backup_$(date +%Y-%m-%d).sql
  ```

- **Yeniden Başlatma**:
  ```bash
  docker-compose restart [service_name]
  ```

## Sorun Giderme

- **500 Internal Server Error**: Log dosyalarını kontrol edin ve Django DEBUG modunu geçici olarak aktifleştirin
- **Nginx 502 Bad Gateway**: Backend servisinin çalıştığından ve erişilebilir olduğundan emin olun
- **Statik Dosya Sorunları**: Django'nun collectstatic komutunu çalıştırın:
  ```bash
  docker-compose exec backend python manage.py collectstatic --noinput
  ```