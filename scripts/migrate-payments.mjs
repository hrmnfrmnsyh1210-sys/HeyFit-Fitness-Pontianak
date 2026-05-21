/**
 * Migrasi fitur pembayaran — tabel payments + kolom classes.harga.
 * Additive & idempoten. Jalankan: npm run db:migrate-payments
 *
 * Sengaja TIDAK pakai `drizzle-kit push` karena push menawarkan truncate
 * tabel users (lihat catatan di scripts/migrate-qr.mjs).
 * Script ini hanya:
 *   1. menambah kolom classes.harga (kalau tabel classes sudah ada)
 *   2. membuat tabel `payments` (pengajuan bukti transfer)
 */
import 'dotenv/config'
import mysql from 'mysql2/promise'

const { TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE } = process.env

if (!TIDB_HOST || !TIDB_USER || !TIDB_PASSWORD || !TIDB_DATABASE) {
  console.error('✘ Konfigurasi TiDB belum lengkap. Isi file .env dulu.')
  process.exit(1)
}

const conn = await mysql.createConnection({
  host: TIDB_HOST,
  port: Number(TIDB_PORT ?? 4000),
  user: TIDB_USER,
  password: TIDB_PASSWORD,
  database: TIDB_DATABASE,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
})

async function tableExists(table) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [TIDB_DATABASE, table],
  )
  return rows.length > 0
}

async function columnExists(table, column) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ? LIMIT 1',
    [TIDB_DATABASE, table, column],
  )
  return rows.length > 0
}

// 1) Kolom classes.harga — hanya kalau tabel classes sudah ada.
//    (Kalau belum ada, migrate-admin akan membuatnya lengkap dengan kolom ini.)
if (!(await tableExists('classes'))) {
  console.log('  ↻ tabel classes belum ada — lewati kolom harga (jalankan db:migrate-admin)')
}
else if (await columnExists('classes', 'harga')) {
  console.log('  ↻ kolom classes.harga sudah ada — dilewati')
}
else {
  await conn.query('ALTER TABLE `classes` ADD COLUMN `harga` INT NOT NULL DEFAULT 0')
  console.log('  ✓ kolom classes.harga dibuat')
}

// 2) Tabel payments — pengajuan pembayaran (bukti transfer).
if (await tableExists('payments')) {
  console.log('  ↻ tabel payments sudah ada — dilewati')
}
else {
  await conn.query(`
    CREATE TABLE \`payments\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NOT NULL,
      \`jenis\` ENUM('membership','kelas') NOT NULL,
      \`paket\` ENUM('bulanan','3bulan','tahunan'),
      \`class_id\` INT,
      \`nominal\` INT NOT NULL,
      \`metode\` ENUM('transfer') NOT NULL DEFAULT 'transfer',
      \`bukti_transfer\` LONGTEXT NOT NULL,
      \`catatan\` VARCHAR(255),
      \`status\` ENUM('menunggu','disetujui','ditolak') NOT NULL DEFAULT 'menunggu',
      \`catatan_admin\` VARCHAR(255),
      \`reviewed_by\` INT,
      \`reviewed_at\` TIMESTAMP NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX \`payments_status_idx\` (\`status\`),
      INDEX \`payments_user_idx\` (\`user_id\`)
    )
  `)
  console.log('  ✓ tabel payments dibuat')
}

await conn.end()
console.log('\nMigrasi pembayaran selesai.')
