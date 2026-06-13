# ERD — Heyfit Fitness

Diagram Entity-Relationship untuk database Heyfit Fitness (8 tabel).
Relasi antar tabel dijaga di level aplikasi (tidak ada FK fisik di DB),
namun secara logika kardinalitasnya digambarkan di bawah.

```mermaid
erDiagram
    users ||--o| memberships  : "punya (1:1)"
    users ||--o{ attendances  : "hadir"
    users ||--o{ attendances  : "men-scan (scanned_by)"
    users ||--o{ bookings     : "memesan"
    users ||--o{ payments     : "mengajukan"
    users ||--o{ payments     : "meninjau (reviewed_by)"

    instructors ||--o{ classes  : "mengajar"
    classes     ||--o{ bookings : "dipesan pada"
    classes     ||--o{ payments : "dibayar untuk"

    users {
        int     id PK
        varchar nama
        varchar email UK
        varchar password_hash
        enum    role "member|admin|owner"
        varchar qr_token UK
        timestamp created_at
    }

    memberships {
        int     id PK
        int     user_id UK "FK->users.id (app-level)"
        enum    paket "bulanan|3bulan|tahunan"
        date    mulai
        date    berakhir
        enum    status "aktif|kadaluarsa"
        timestamp created_at
        timestamp updated_at
    }

    attendances {
        int     id PK
        int     user_id "FK->users.id (app-level)"
        int     scanned_by "FK->users.id (admin/owner)"
        timestamp created_at
    }

    instructors {
        int     id PK
        varchar nama
        varchar spesialisasi
        varchar bio
        boolean aktif
        timestamp created_at
    }

    classes {
        int     id PK
        varchar nama
        enum    kategori "Mind&Body|Cardio|Strength|Dance"
        int     instructor_id "FK->instructors.id (nullable)"
        varchar jadwal
        int     durasi_menit
        int     kuota
        int     intensitas "1-3"
        int     harga
        int     masa_berlaku_hari
        boolean aktif
        timestamp created_at
    }

    bookings {
        int     id PK
        int     class_id "FK->classes.id (app-level)"
        int     user_id "FK->users.id (app-level)"
        date    berlaku_sampai
        timestamp created_at
    }

    payments {
        int     id PK
        int     user_id "FK->users.id"
        enum    jenis "membership|kelas"
        enum    paket "bulanan|3bulan|tahunan (nullable)"
        int     class_id "FK->classes.id (nullable)"
        int     nominal
        enum    metode "transfer"
        text    bukti_transfer
        varchar catatan
        enum    status "menunggu|disetujui|ditolak"
        varchar catatan_admin
        int     reviewed_by "FK->users.id (admin)"
        timestamp reviewed_at
        timestamp created_at
    }

    galleries {
        int     id PK
        varchar judul
        varchar kategori
        varchar ringkasan
        text    konten
        text    gambar
        boolean tampil
        timestamp created_at
        timestamp updated_at
    }
```

## Catatan relasi

| Relasi | Kardinalitas | Kunci | Keterangan |
| --- | --- | --- | --- |
| users → memberships | 1 : 0..1 | `memberships.user_id` (UNIQUE) | Satu user maksimal satu baris membership. |
| users → attendances | 1 : 0..N | `attendances.user_id` | Member yang hadir (check-in). |
| users → attendances | 1 : 0..N | `attendances.scanned_by` | Admin/owner yang men-scan QR. |
| users → bookings | 1 : 0..N | `bookings.user_id` | Member yang memesan kelas. |
| classes → bookings | 1 : 0..N | `bookings.class_id` | UNIQUE(class_id, user_id) → 1 reservasi/kelas. |
| instructors → classes | 1 : 0..N | `classes.instructor_id` (nullable) | Satu instruktur mengajar banyak kelas. |
| users → payments | 1 : 0..N | `payments.user_id` | Member yang mengajukan pembayaran. |
| users → payments | 1 : 0..N | `payments.reviewed_by` | Admin yang meninjau pembayaran. |
| classes → payments | 1 : 0..N | `payments.class_id` (nullable) | Hanya untuk pembayaran `jenis='kelas'`. |
| galleries | — | — | Tabel mandiri, tanpa relasi. |

> **Catatan:** Semua relasi dijaga di level aplikasi (session-based), bukan
> foreign key fisik di TiDB/MySQL. Lihat [server/database/schema.ts](../server/database/schema.ts).
