# DOKUMENTASI MAPPING API  
## Sistem Integrasi KUA – Dukcapil Pasca Pernikahan

---

## 1. Pendahuluan

Dokumen ini menjelaskan **pemetaan endpoint API berbasis peran (Role-Based Access Control / RBAC)**  
untuk sistem kerja sama **KUA – Dukcapil – Kemenag**, dengan tujuan:

- Mempercepat proses perubahan data kependudukan pasca pernikahan
- Menjamin pemisahan tugas (segregation of duties)
- Menyediakan jejak audit yang kuat
- Mendukung tata kelola pemerintahan yang baik (good governance)

Dokumen ini **konsisten dengan BPMN, RBAC, SOP, dan UI dashboard ala SIAK**.

---

## 2. Prinsip Desain API (Baseline)

Seluruh endpoint pada sistem ini **WAJIB** mengikuti prinsip berikut:

1. **Role-Based Access Control (RBAC)**  
   Akses endpoint dikontrol menggunakan token (JWT / session) dan role user.

2. **State-Driven Workflow**  
   Endpoint hanya dapat dipanggil sesuai status pengajuan.

3. **No Role Overlap**  
   Tidak ada role yang dapat mengambil alih kewenangan role lain.

4. **Audit-First Design**  
   Setiap endpoint mutasi data (`POST`, `PUT`, `DELETE`) wajib menghasilkan audit log.

---

## 3. Entitas Utama Sistem

| Entitas | Deskripsi |
|-------|----------|
| `users` | Data akun dan role |
| `submissions` | Pengajuan perubahan data |
| `documents` | Dokumen pendukung |
| `logs` | Audit trail |
| `reports` | Laporan |
| `statistics` | Data agregat dan monitoring |

---

## 4. Mapping API Endpoint per Role

### 4.1 AUTH & COMMON (Semua Role)

| Method | Endpoint | Fungsi |
|------|---------|--------|
| POST | `/auth/login` | Login pengguna |
| POST | `/auth/logout` | Logout |
| PUT | `/auth/change-password` | Ganti password |
| GET | `/auth/me` | Profil user |

---

### 4.2 KUA – Pengajuan

#### Pengajuan (Submission)

| Method | Endpoint | Fungsi | Catatan |
|------|---------|--------|--------|
| POST | `/kua/submissions` | Buat pengajuan baru | Status: `DRAFT` |
| PUT | `/kua/submissions/{id}` | Edit draft | ❌ jika status ≠ `DRAFT` |
| POST | `/kua/submissions/{id}/submit` | Ajukan pengajuan | Status → `DIAJUKAN` |
| GET | `/kua/submissions` | Riwayat pengajuan | Milik sendiri |
| GET | `/kua/submissions/{id}` | Detail pengajuan | Read-only |

#### Dokumen

| Method | Endpoint | Fungsi |
|------|---------|--------|
| POST | `/kua/submissions/{id}/documents` | Upload dokumen |
| DELETE | `/kua/documents/{id}` | Hapus dokumen (draft only) |

#### Laporan

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/kua/reports/submissions` | Laporan pengajuan KUA |

---

### 4.3 Operator Dukcapil – Pemrosesan

#### Antrian & Proses

| Method | Endpoint | Fungsi | Status Valid |
|------|---------|--------|--------------|
| GET | `/dukcapil/operator/queue` | Ambil antrian | `DIAJUKAN` |
| POST | `/dukcapil/operator/submissions/{id}/assign` | Klaim pengajuan | Lock oleh operator |
| GET | `/dukcapil/operator/submissions/{id}` | Detail pengajuan | Read-only |

#### Proses Teknis

| Method | Endpoint | Fungsi |
|------|---------|--------|
| PUT | `/dukcapil/operator/submissions/{id}/process` | Input/update hasil proses |
| POST | `/dukcapil/operator/submissions/{id}/return` | Kembalikan ke KUA |
| POST | `/dukcapil/operator/submissions/{id}/send-verification` | Kirim ke verifikator |

**Perubahan Status:**
- `PERLU_PERBAIKAN`
- `MENUNGGU_VERIFIKASI`

#### Laporan Operator

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/dukcapil/operator/reports` | Laporan kerja operator |

---

### 4.4 Verifikator Dukcapil – Finalisasi

#### Verifikasi

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/dukcapil/verifier/queue` | Daftar menunggu verifikasi |
| GET | `/dukcapil/verifier/submissions/{id}` | Review detail |
| POST | `/dukcapil/verifier/submissions/{id}/approve` | Setujui & final |
| POST | `/dukcapil/verifier/submissions/{id}/reject` | Tolak (wajib alasan) |

**Status Akhir:**
- `SELESAI`
- `DITOLAK`

#### Laporan Verifikasi

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/dukcapil/verifier/reports` | Statistik verifikasi |

---

### 4.5 Kemenag – Monitoring

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/kemenag/statistics/kua` | Statistik per KUA |
| GET | `/kemenag/statistics/kecamatan` | Statistik per kecamatan |
| GET | `/kemenag/reports/performance` | Laporan kinerja |
| GET | `/kemenag/submissions` | Read-only semua pengajuan |

---

### 4.6 Admin – Sistem & Audit

#### User & Role

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/admin/users` | List user |
| POST | `/admin/users` | Tambah user |
| PUT | `/admin/users/{id}` | Edit user |
| PUT | `/admin/users/{id}/reset-password` | Reset password |
| PUT | `/admin/users/{id}/role` | Atur role |

#### Logs & System

| Method | Endpoint | Fungsi |
|------|---------|--------|
| GET | `/admin/logs` | Audit log |
| GET | `/admin/system/health` | Status sistem |

---

## 5. Mapping Endpoint vs Status Pengajuan

| Status | Akses |
|------|------|
| `DRAFT` | Edit, upload, delete (KUA) |
| `DIAJUKAN` | Assign operator |
| `PERLU_PERBAIKAN` | Edit ulang (KUA) |
| `MENUNGGU_VERIFIKASI` | Approve / Reject |
| `SELESAI` | Read-only |
| `DITOLAK` | Read-only |

---

## 6. Contoh Flow API (Ringkas)

1. KUA → `POST /kua/submissions`
2. KUA → `POST /kua/submissions/{id}/submit`
3. Operator → `POST /dukcapil/operator/submissions/{id}/assign`
4. Operator → `PUT /dukcapil/operator/submissions/{id}/process`
5. Operator → `POST /send-verification`
6. Verifikator → `POST /approve`
7. Sistem → Logging & Statistik

---

## 7. Catatan Arsitektural (Disarankan)

- Gunakan **Finite State Machine (FSM)**
- Terapkan **soft delete** untuk dokumen
- Gunakan **optimistic locking**
- Semua endpoint mutasi → **wajib audit log**

---



