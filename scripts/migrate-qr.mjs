/**
 * Migrasi fitur QR check-in member — additive & idempoten.
 * Jalankan: npm run db:migrate-qr
 *
 * Sengaja TIDAK pakai `drizzle-kit push` karena push ingin sekaligus
 * mengubah constraint lain (users_email_unique) dan menawarkan truncate.
 * Script ini hanya:
 *   1. menambah kolom users.qr_token (+ unique index)
 *   2. membuat tabel attendances
 * Aman dijalankan berulang — setiap langkah dicek dulu.
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

async function columnExists(table, column) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ? LIMIT 1',
    [TIDB_DATABASE, table, column],
  )
  return rows.length > 0
}

async function tableExists(table) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [TIDB_DATABASE, table],
  )
  return rows.length > 0
}

async function indexExists(table, index) {
  const [rows] = await conn.query(
    'SELECT 1 FROM information_schema.statistics WHERE table_schema = ? AND table_name = ? AND index_name = ? LIMIT 1',
    [TIDB_DATABASE, table, index],
  )
  return rows.length > 0
}

// 1) Kolom qr_token di users
if (await columnExists('users', 'qr_token')) {
  console.log('  ↻ users.qr_token sudah ada — dilewati')
}
else {
  await conn.query('ALTER TABLE `users` ADD COLUMN `qr_token` VARCHAR(64) NULL')
  console.log('  ✓ kolom users.qr_token dibuat')
}

// 2) Unique index untuk qr_token
if (await indexExists('users', 'users_qr_token_unique')) {
  console.log('  ↻ index users_qr_token_unique sudah ada — dilewati')
}
else {
  await conn.query('ALTER TABLE `users` ADD UNIQUE INDEX `users_qr_token_unique` (`qr_token`)')
  console.log('  ✓ unique index users_qr_token_unique dibuat')
}

// 3) Tabel attendances
if (await tableExists('attendances')) {
  console.log('  ↻ tabel attendances sudah ada — dilewati')
}
else {
  await conn.query(`
    CREATE TABLE \`attendances\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NOT NULL,
      \`scanned_by\` INT,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('  ✓ tabel attendances dibuat')
}

await conn.end()
console.log('\nMigrasi QR selesai.')
