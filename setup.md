# TIDA - Production Docker Setup Guide

This guide explains how to deploy the TIDA project in a production environment using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- Server or VPS (min. 2GB RAM, 2 CPU cores)

## Installation Steps

1. **Prepare Project Files**

   Place the following files in the respective directories of your project:
   
   - `docker-compose.yml` → Root directory
   - `tida-backend/Dockerfile` → Backend folder
   - `tida-backend/entrypoint.sh` → Backend folder
   - `tida-backend/requirements.txt` → Backend folder (or update existing file)
   - `tida-frontend/Dockerfile` → Frontend folder
   - `nginx/conf.d/default.conf` → nginx/conf.d folder (create this folder if needed)
   - `.env` → Root directory

2. **Update Django settings.py**

   Modify the `tida-backend/tida_backend/settings.py` file with the provided updates.

3. **Add nginx Configuration for Frontend**

   Create `/tida-frontend/nginx.conf` file to ensure the Frontend Dockerfile works correctly:

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

4. **Create Directory Structure**

   ```bash
   mkdir -p nginx/conf.d nginx/ssl
   ```

5. **Set File Permissions**

   ```bash
   chmod +x tida-backend/entrypoint.sh
   ```

6. **Launch with Docker Compose**

   ```bash
   docker-compose up -d
   ```

7. **Create Superuser (First time only)**

   ```bash
   docker-compose exec backend python manage.py createsuperuser --noinput
   ```

## Production Environment Security Settings

1. **SSL/TLS Configuration**

   Obtain an SSL certificate using Let's Encrypt and place it in the nginx/ssl directory:

   ```bash
   # Install Certbot (Ubuntu/Debian)
   apt-get update
   apt-get install certbot python3-certbot-nginx
   
   # Obtain certificate
   certbot certonly --standalone -d tida.example.com
   
   # Copy certificates
   cp /etc/letsencrypt/live/tida.example.com/fullchain.pem nginx/ssl/tida.crt
   cp /etc/letsencrypt/live/tida.example.com/privkey.pem nginx/ssl/tida.key
   ```

   Then activate the SSL section in your nginx configuration.

2. **Secure Environment Variables**

   Remember to update all passwords and SECRET_KEY values in the `.env` file.

3. **Firewall Configuration**

   ```bash
   # UFW example (Ubuntu)
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

4. **Regular Updates**

   Update Docker images and your system regularly:

   ```bash
   # Update Docker images
   docker-compose down
   docker-compose pull
   docker-compose up -d
   
   # System updates
   apt-get update && apt-get upgrade
   ```

## Maintenance and Monitoring

- **Log Records**:
  ```bash
  docker-compose logs -f [service_name]
  ```

- **Database Backup**:
  ```bash
  docker-compose exec db pg_dump -U postgres tida > backup_$(date +%Y-%m-%d).sql
  ```

- **Restart Services**:
  ```bash
  docker-compose restart [service_name]
  ```

## Troubleshooting

- **500 Internal Server Error**: Check log files and temporarily enable Django DEBUG mode
- **Nginx 502 Bad Gateway**: Ensure the backend service is running and accessible
- **Static File Issues**: Run Django's collectstatic command:
  ```bash
  docker-compose exec backend python manage.py collectstatic --noinput
  ```

## Common Docker Commands

- **View running containers**:
  ```bash
  docker ps
  ```

- **View container logs**:
  ```bash
  docker logs [container_id]
  ```

- **Access container shell**:
  ```bash
  docker exec -it [container_id] bash
  ```

- **Rebuild specific service**:
  ```bash
  docker-compose build [service_name]
  docker-compose up -d [service_name]
  ```