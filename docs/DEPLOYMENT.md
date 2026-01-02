# Panduan Deployment ke Portainer

Dokumen ini menjelaskan cara deploy project KUA-Dukcapil ke server menggunakan Docker melalui Portainer.

## 📋 Prerequisites

- Server dengan Docker terinstall
- Portainer sudah terpasang dan berjalan
- Access ke Portainer dashboard
- Port 3100 (backend) dan 2200 (frontend) tersedia di server

## 🔧 Langkah-langkah Deployment

### 1. Persiapan File

**a. Upload Project ke Server**

```bash
# Melalui Git
git clone <repository-url>
cd project-x

# Atau upload manual melalui SCP/FTP
scp -r project-x user@server:/path/to/project-x
```

**b. Konfigurasi Environment Variables**

Edit file `.env` di root project:

```bash
DB_USER=postgres
DB_PASS=your_secure_password_here
DB_NAME=kua_dukcapil_db
JWT_SECRET=your_strong_jwt_secret_key_here
```

Edit file `frontend/.env.production`:

```bash
# Ganti dengan IP server atau domain Anda
VITE_API_BASE_URL=http://YOUR_SERVER_IP:3100/api/v1
```

> **PENTING**: Pastikan URL backend sesuai dengan IP/domain server Anda!

### 2. Deploy melalui Portainer

#### Opsi A: Menggunakan Stack

1. **Login ke Portainer**
   - Buka browser dan akses Portainer dashboard
   - Login dengan credentials Anda

2. **Buat Stack Baru**
   - Klik menu **Stacks**
   - Klik tombol **+ Add stack**
   - Berikan nama: `kua-dukcapil-system`

3. **Upload Docker Compose**
   - Pilih **Upload** atau **Git repository**
   - Jika upload: Upload file `docker-compose.yml`
   - Jika Git: Masukkan repository URL dan branch

4. **Set Environment Variables**
   
   Tambahkan environment variables berikut:
   
   | Name | Value |
   |------|-------|
   | `DB_USER` | `postgres` |
   | `DB_PASS` | `your_secure_password` |
   | `DB_NAME` | `kua_dukcapil_db` |
   | `JWT_SECRET` | `your_jwt_secret_key` |

5. **Deploy Stack**
   - Klik **Deploy the stack**
   - Tunggu hingga semua container berjalan

#### Opsi B: Build dari Repository

1. **Clone Repository di Server**
   ```bash
   git clone <repository-url> /opt/kua-dukcapil
   cd /opt/kua-dukcapil
   ```

2. **Konfigurasi Files**
   - Edit `.env` dengan credentials yang sesuai
   - Edit `frontend/.env.production` dengan URL backend

3. **Deploy via Portainer**
   - Di Portainer, pilih **Stacks** → **Add stack**
   - Pilih **Repository**
   - Masukkan path: `/opt/kua-dukcapil`
   - Deploy

### 3. Verifikasi Deployment

**a. Cek Status Container**

Di Portainer:
- Navigate ke **Containers**
- Verifikasi 3 containers berjalan:
  - `kua-dukcapil-system-db`
  - `kua-dukcapil-system-backend`
  - `kua-dukcapil-system-frontend`

**b. Test Akses Aplikasi**

```bash
# Test Backend API
curl http://your_server_ip:3100/api/v1/health

# Test Frontend
curl http://your_server_ip:2200
```

Atau buka di browser:
- **Frontend**: `http://your_server_ip:2200`
- **Backend API**: `http://your_server_ip:3100/api/v1`

### 4. Migrasi Database

Setelah container berjalan, jalankan migrasi database:

```bash
# Masuk ke container backend
docker exec -it kua-dukcapil-system-backend-1 sh

# Jalankan migrasi Prisma
npx prisma migrate deploy

# Seed database (opsional - untuk data awal)
npx prisma db seed

# Keluar dari container
exit
```

Atau melalui Portainer:
1. Klik container **backend**
2. Pilih **Console**
3. Klik **Connect**
4. Jalankan command di atas

## 🔐 Konfigurasi Keamanan

### Firewall Rules

Pastikan port yang diperlukan terbuka:

```bash
# Ubuntu/Debian
sudo ufw allow 3100/tcp  # Backend
sudo ufw allow 2200/tcp  # Frontend
sudo ufw allow 5432/tcp  # PostgreSQL (internal only, optional)

# Reload firewall
sudo ufw reload
```

### Password & Secrets

> **⚠️ PERINGATAN KEAMANAN**
> - **JANGAN** gunakan password default di production
> - Gunakan password yang kuat dan unik
> - Simpan JWT_SECRET dengan aman
> - Pertimbangkan menggunakan Docker Secrets untuk kredensial

## 📊 Monitoring & Logs

### Melihat Logs

**Via Portainer:**
1. Navigate ke **Containers**
2. Klik nama container
3. Pilih tab **Logs**

**Via Command Line:**
```bash
# Semua containers
docker-compose logs -f

# Container spesifik
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Health Check

```bash
# Backend health
curl http://your_server_ip:3100/api/v1/health

# Database connection
docker exec -it kua-dukcapil-system-db-1 psql -U postgres -d kua_dukcapil_db -c "SELECT 1;"
```

## 🔄 Update Aplikasi

### Update Image/Code

```bash
# Pull latest code
cd /opt/kua-dukcapil
git pull origin main

# Rebuild containers via Portainer
# 1. Stop stack
# 2. Click "Pull and redeploy"
# Atau via CLI:
docker-compose up -d --build
```

### Backup Database

```bash
# Backup
docker exec kua-dukcapil-system-db-1 pg_dump -U postgres kua_dukcapil_db > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20241229.sql | docker exec -i kua-dukcapil-system-db-1 psql -U postgres kua_dukcapil_db
```

## 🐛 Troubleshooting

### Container tidak start

```bash
# Cek logs
docker-compose logs backend
docker-compose logs frontend

# Cek status
docker-compose ps

# Restart container
docker-compose restart backend
```

### Database connection error

```bash
# Cek database berjalan
docker-compose ps db

# Cek koneksi
docker exec -it kua-dukcapil-system-backend-1 sh
nc -zv db 5432
```

### Frontend tidak bisa akses Backend

1. Verifikasi `VITE_API_BASE_URL` di `frontend/.env.production`
2. Pastikan menggunakan IP/domain server yang benar
3. Rebuild frontend:
   ```bash
   docker-compose up -d --build frontend
   ```

### Port sudah digunakan

```bash
# Cek port yang digunakan
netstat -tulpn | grep 3100
netstat -tulpn | grep 2200

# Ubah port di docker-compose.yml jika perlu
```

## 📝 Catatan Penting

1. **Ports**: Backend (3100), Frontend (2200)
2. **Environment**: Pastikan `.env` dan `frontend/.env.production` sudah dikonfigurasi
3. **Database**: Data disimpan di Docker volume `postgres_data`
4. **Uploads**: File upload disimpan di volume `app_uploads`
5. **Backup**: Lakukan backup database secara berkala

## 🔗 Akses Default

Setelah deployment sukses:

- **Frontend**: `http://your_server_ip:2200`
- **Backend API**: `http://your_server_ip:3100/api/v1`

**Default Credentials:**
- KUA Officer: `kua_officer` / `password123`
- Dukcapil Operator: `dukcapil_op` / `password123`
- Admin: `admin` / `password123`

> **⚠️ SEGERA GANTI PASSWORD DEFAULT SETELAH LOGIN PERTAMA KALI!**

## 📞 Support

Jika mengalami masalah, cek:
1. Logs di Portainer
2. Status container
3. Environment variables
4. Network connectivity
5. Firewall rules
