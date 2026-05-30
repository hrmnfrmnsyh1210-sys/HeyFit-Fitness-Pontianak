/**
 * Migrasi masa berlaku booking kelas. Additive & idempoten.
 * Jalankan: npm run db:migrate-booking-expiry
 *
 * Sengaja TIDAK pakai `drizzle-kit push` (lihat catatan di scripts/migrate-qr.mjs).
 * Script ini:
 *   1. menambah kolom classes.masa_berlaku_hari (default 30 hari)
 *   2. menambah kolom bookings.berlaku_sampai (DATE, null = tanpa batas)
 *   3. backfill: booking lama yang belum punya tanggal berakhir diberi
 *      berlaku_sampai = created_at + 30 hari, supaya aturan langsung berlaku.
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

// 1) classes.masa_berlaku_hari
if (!(await tableExists('classes'))) {
  console.log('  ↻ tabel classes belum ada — lewati (jalankan db:migrate-admin dulu)')
}
else if (await columnExists('classes', 'masa_berlaku_hari')) {
  console.log('  ↻ kolom classes.masa_berlaku_hari sudah ada — dilewati')
}
else {
  await conn.query('ALTER TABLE `classes` ADD COLUMN `masa_berlaku_hari` INT NOT NULL DEFAULT 30')
  console.log('  ✓ kolom classes.masa_berlaku_hari dibuat (default 30 hari)')
}

// 2) bookings.berlaku_sampai
if (!(await tableExists('bookings'))) {
  console.log('  ↻ tabel bookings belum ada — lewati (jalankan db:migrate-bookings dulu)')
}
else if (await columnExists('bookings', 'berlaku_sampai')) {
  console.log('  ↻ kolom bookings.berlaku_sampai sudah ada — dilewati')
}
else {
  await conn.query('ALTER TABLE `bookings` ADD COLUMN `berlaku_sampai` DATE NULL')
  console.log('  ✓ kolom bookings.berlaku_sampai dibuat')

  // 3) Backfill booking lama: berlaku 30 hari sejak dibuat.
  const [res] = await conn.query(
    'UPDATE `bookings` SET `berlaku_sampai` = DATE(DATE_ADD(`created_at`, INTERVAL 30 DAY)) WHERE `berlaku_sampai` IS NULL',
  )
  console.log(`  ✓ backfill berlaku_sampai untuk ${res.affectedRows} booking lama (created_at + 30 hari)`)
}

await conn.end()
console.log('\nMigrasi masa berlaku booking selesai.')
