-- ============================================================
--  Heyfit Fitness — skema database LOKAL (MySQL / MariaDB)
-- ============================================================
--  Cara pakai (phpMyAdmin / XAMPP / Laragon):
--    1. Buka phpMyAdmin (http://localhost/phpmyadmin)
--    2. Klik tab "Import" di kiri atas (tanpa memilih database dulu)
--    3. Pilih file ini lalu klik "Go / Kirim"
--    4. Database "heyfit" + semua tabel akan dibuat
--    5. Isi akun default: jalankan `npm run db:seed`
--
--  Atau lewat terminal:
--    mysql -u root -p < server/database/heyfit-local.sql
--
--  Struktur mengikuti server/database/schema.ts (dialect MySQL).
-- ============================================================

CREATE DATABASE IF NOT EXISTS `heyfit`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `heyfit`;

-- ── users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('member','admin','owner') NOT NULL DEFAULT 'member',
  `qr_token` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_qr_token_unique` (`qr_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── memberships ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `memberships` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `paket` ENUM('bulanan','3bulan','tahunan') NOT NULL,
  `mulai` DATE NOT NULL,
  `berakhir` DATE NOT NULL,
  `status` ENUM('aktif','kadaluarsa') NOT NULL DEFAULT 'aktif',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `memberships_user_id_unique` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── attendances ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `attendances` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `scanned_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── instructors ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `instructors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(120) NOT NULL,
  `spesialisasi` VARCHAR(120) NOT NULL,
  `bio` VARCHAR(400) DEFAULT NULL,
  `aktif` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── classes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(120) NOT NULL,
  `kategori` ENUM('Mind & Body','Cardio','Strength','Dance') NOT NULL,
  `instructor_id` INT DEFAULT NULL,
  `jadwal` VARCHAR(120) NOT NULL,
  `durasi_menit` INT NOT NULL DEFAULT 60,
  `kuota` INT NOT NULL DEFAULT 15,
  `intensitas` INT NOT NULL DEFAULT 2,
  `harga` INT NOT NULL DEFAULT 0,
  `masa_berlaku_hari` INT NOT NULL DEFAULT 30,
  `aktif` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── bookings ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `class_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `berlaku_sampai` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_class_user_unique` (`class_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── payments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `jenis` ENUM('membership','kelas') NOT NULL,
  `paket` ENUM('bulanan','3bulan','tahunan') DEFAULT NULL,
  `class_id` INT DEFAULT NULL,
  `nominal` INT NOT NULL,
  `metode` ENUM('transfer') NOT NULL DEFAULT 'transfer',
  -- Bukti transfer disimpan sebagai data URL base64 → LONGTEXT.
  `bukti_transfer` LONGTEXT NOT NULL,
  `catatan` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('menunggu','disetujui','ditolak') NOT NULL DEFAULT 'menunggu',
  `catatan_admin` VARCHAR(255) DEFAULT NULL,
  `reviewed_by` INT DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── galleries ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `galleries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(160) NOT NULL,
  `kategori` VARCHAR(60) NOT NULL DEFAULT 'Berita',
  `ringkasan` VARCHAR(300) DEFAULT NULL,
  `konten` TEXT DEFAULT NULL,
  -- Foto disimpan sebagai data URL base64 → LONGTEXT.
  `gambar` LONGTEXT NOT NULL,
  `tampil` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
