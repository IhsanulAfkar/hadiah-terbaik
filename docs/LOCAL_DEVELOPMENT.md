# Using .env.local for Local Development

## Overview

File `.env.local` dibuat untuk development di **Docker Desktop** agar tidak tabrakan dengan konfigurasi production di `.env`.

## Environment Files Structure

```
project/
├── .env                # Production (Portainer)
├── .env.local          # Local Development (Docker Desktop) ← Use this!
└── .env.example        # Template
```

## Using .env.local

### Option 1: Rename Before Docker Compose (Recommended)

```bash
# 1. Backup production .env
copy .env .env.production.backup

# 2. Copy local config to .env
copy .env.local .env

# 3. Start Docker Desktop
docker-compose up -d --build

# 4. When done, restore production config (if needed)
copy .env.production.backup .env
```

### Option 2: Use Docker Compose --env-file Flag

```bash
docker-compose --env-file .env.local up -d --build
```

### Option 3: Create docker-compose.override.yml

Create `docker-compose.override.yml`:
```yaml
version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=development
      - JWT_EXPIRES_IN=8h
      - CORS_ORIGIN=http://localhost:2200

  frontend:
    build:
      args:
        VITE_API_BASE_URL: http://localhost:3100/api/v1
```

Docker Compose will automatically merge this with `docker-compose.yml`.

## Configuration Differences

### Production (.env)
```env
NODE_ENV=production
JWT_EXPIRES_IN=2h
CORS_ORIGIN=https://ht.nasruladitri.space
VITE_API_BASE_URL=https://api-ht.nasruladitri.space/api/v1
```

### Local (.env.local)
```env
NODE_ENV=development
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:2200
VITE_API_BASE_URL=http://localhost:3100/api/v1
```

## Quick Start Guide

```bash
# 1. Use local config
copy .env.local .env

# 2. Start services
docker-compose up -d --build

# 3. Access application
Frontend: http://localhost:2200
Backend:  http://localhost:3100
API Docs: http://localhost:3100/api-docs

# 4. Login with default credentials
Username: admin
Password: password123
```

## Benefits

✅ **No Conflicts**: Production config di `.env` tetap aman  
✅ **Longer Sessions**: 8h untuk development convenience  
✅ **Localhost URLs**: Tidak perlu domain/HTTPS  
✅ **Easy Switch**: Copy file untuk switch environment  

## Important Notes

⚠️ **DO NOT commit .env.local** - Already in `.gitignore`  
⚠️ **Always use .env for Portainer** - Production config  
⚠️ **Database Port**: PostgreSQL on `localhost:5432`  

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
netstat -ano | findstr :3100
netstat -ano | findstr :2200
netstat -ano | findstr :5432

# Stop existing containers
docker-compose down
```

### Database Connection Failed

```bash
# Check database container
docker-compose ps

# View database logs
docker-compose logs db

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Frontend Shows 404

- Check `VITE_API_BASE_URL` in `.env`
- Rebuild frontend: `docker-compose build --no-cache frontend`
- Check browser console for errors
