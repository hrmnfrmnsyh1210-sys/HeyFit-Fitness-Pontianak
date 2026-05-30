/**
 * Migrasi fitur galeri/berita — tabel galleries. Additive & idempoten.
 * Jalankan: npm run db:migrate-gallery
 *
 * Sengaja TIDAK pakai `drizzle-kit push` karena push menawarkan truncate
 * tabel users (lihat catatan di scripts/migrate-qr.mjs).
 * Script ini hanya membuat tabel `galleries` kalau belum ada.
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

// Tabel galleries — galeri foto / berita Heyfit.
if (await tableExists('galleries')) {
  console.log('  ↻ tabel galleries sudah ada — dilewati')
}
else {
  await conn.query(`
    CREATE TABLE \`galleries\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`judul\` VARCHAR(160) NOT NULL,
      \`kategori\` VARCHAR(60) NOT NULL DEFAULT 'Berita',
      \`ringkasan\` VARCHAR(300),
      \`konten\` TEXT,
      \`gambar\` LONGTEXT NOT NULL,
      \`tampil\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`galleries_tampil_idx\` (\`tampil\`)
    )
  `)
  console.log('  ✓ tabel galleries dibuat')
}

await conn.end()
console.log('\nMigrasi galeri selesai.')
