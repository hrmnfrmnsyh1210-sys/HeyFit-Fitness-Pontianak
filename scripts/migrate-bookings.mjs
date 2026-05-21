/**
 * Migrasi fitur booking kelas — tabel bookings. Additive & idempoten.
 * Jalankan: npm run db:migrate-bookings
 *
 * Sengaja TIDAK pakai `drizzle-kit push` karena push menawarkan truncate
 * tabel users (lihat catatan di scripts/migrate-qr.mjs).
 * Script ini hanya membuat tabel `bookings` kalau belum ada — satu baris
 * mewakili satu member yang terdaftar pada satu kelas.
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

// Tabel bookings — reservasi member untuk kelas.
if (await tableExists('bookings')) {
  console.log('  ↻ tabel bookings sudah ada — dilewati')
}
else {
  await conn.query(`
    CREATE TABLE \`bookings\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`class_id\` INT NOT NULL,
      \`user_id\` INT NOT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE INDEX \`bookings_class_user_unique\` (\`class_id\`, \`user_id\`)
    )
  `)
  console.log('  ✓ tabel bookings dibuat')
}

await conn.end()
console.log('\nMigrasi booking selesai.')
