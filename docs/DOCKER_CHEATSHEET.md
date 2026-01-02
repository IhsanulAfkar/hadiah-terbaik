# Docker Optimization & Command Guide

Dokumen ini berisi kumpulan perintah Docker CLI yang paling optimal untuk workflow development Anda, berdasarkan konfigurasi yang telah kita optimasi (Caching, npm ci, dll).

## 🚀 Perintah Utama (Daily Workflow)

Gunakan perintah ini untuk sehari-hari. Ini akan menggunakan cache jika tidak ada perubahan package, tapi tetap memaksa build ulang jika ada perubahan kode.

```powershell
# Jalankan semua service (Frontend + Backend + DB)
docker-compose up -d --build
```

- `-d`: Detached (jalan di background).
- `--build`: Build ulang image jika ada perubahan kode, tapi tetap pakai cache layer yang valid.

---

## 🛠️ Perintah Build Spesifik

Jika Anda hanya mengubah satu sisi (misal hanya backend), tidak perlu restart semuanya.

### Backend Only
```powershell
docker-compose up -d --build --force-recreate backend
```
*Gunakan ini setelah mengubah kode backend atau `package.json` backend.*

### Frontend Only
```powershell
docker-compose up -d --build --force-recreate frontend
```
*Gunakan ini setelah mengubah kode frontend atau `package.json` frontend.*

---

## 🧹 Clean Build (Jurus Pamungkas)

Gunakan perintah ini **HANYA** jika:
1. Anda curiga ada cache yang 'nyangkut' atau korup.
2. Anda ingin memastikan environment benar-benar 100% bersih dari nol.
3. Internet Anda stabil (karena akan download ulang semua dependency).

```powershell
# 1. Matikan semua
docker-compose down

# 2. Build ulang dari nol (abaikan cache)
docker-compose build --no-cache

# 3. Jalankan dengan paksa recreate container
docker-compose up -d --force-recreate
```

*Atau one-liner (PowerShell):*
```powershell
docker-compose build --no-cache; docker-compose up -d --force-recreate
```

---

## 📖 Kamus Flag

| Flag | Fungsi | Kapan Dipakai? |
| :--- | :--- | :--- |
| `-d` | **Detached**. Menjalankan container di background agar terminal tidak terkunci. | Hampir selalu. |
| `--build` | Build image sebelum start container. | Saat ada perubahan kode apapun. |
| `--force-recreate` | Memaksa container dimatikan & dibuat ulang meski config tidak berubah. | Saat ingin me-reset state container atau memastikan image terbaru dipakai. |
| `--no-cache` | **Jangan pakai cache**. Build image dari nol total. | Saat debugging error aneh, update versi OS base image, atau koneksi internet sangat kencang. |

## ⚠️ Troubleshooting Network (ECONNRESET)

Jika Anda mengalami error `ECONNRESET` saat build `--no-cache`, Dockerfile Anda sudah dilindungi dengan:
1. `maxsockets 1`: Membatasi koneksi simultan (satu per satu).
2. `fetch-retry`: Mencoba ulang otomatis jika gagal download.

Pastikan koneksi internet stabil, dan hindari VPN jika bermasalah dengan registry npm.
