/**
 * Migrasi modul admin — tabel instructors & classes. Additive & idempoten.
 * Jalankan: npm run db:migrate-admin
 *
 * Sengaja TIDAK pakai `drizzle-kit push` karena push menawarkan truncate
 * tabel users (lihat catatan di scripts/migrate-qr.mjs).
 * Script ini hanya membuat tabel baru kalau belum ada, lalu mengisi
 * beberapa baris contoh supaya dashboard admin tidak kosong.
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

async function rowCount(table) {
  const [rows] = await conn.query(`SELECT COUNT(*) AS n FROM \`${table}\``)
  return Number(rows[0]?.n ?? 0)
}

// 1) Tabel instructors
if (await tableExists('instructors')) {
  console.log('  ↻ tabel instructors sudah ada — dilewati')
}
else {
  await conn.query(`
    CREATE TABLE \`instructors\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`nama\` VARCHAR(120) NOT NULL,
      \`spesialisasi\` VARCHAR(120) NOT NULL,
      \`bio\` VARCHAR(400),
      \`aktif\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('  ✓ tabel instructors dibuat')
}

// 2) Tabel classes
if (await tableExists('classes')) {
  console.log('  ↻ tabel classes sudah ada — dilewati')
}
else {
  await conn.query(`
    CREATE TABLE \`classes\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`nama\` VARCHAR(120) NOT NULL,
      \`kategori\` ENUM('Mind & Body','Cardio','Strength','Dance') NOT NULL,
      \`instructor_id\` INT,
      \`jadwal\` VARCHAR(120) NOT NULL,
      \`durasi_menit\` INT NOT NULL DEFAULT 60,
      \`kuota\` INT NOT NULL DEFAULT 15,
      \`intensitas\` INT NOT NULL DEFAULT 2,
      \`aktif\` BOOLEAN NOT NULL DEFAULT TRUE,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('  ✓ tabel classes dibuat')
}

// 3) Data contoh — hanya kalau tabel masih kosong
if (await rowCount('instructors') === 0) {
  await conn.query(
    `INSERT INTO \`instructors\` (\`nama\`, \`spesialisasi\`, \`bio\`) VALUES ?`,
    [[
      ['Sari Putri', 'Yoga & Mobility', 'Instruktur yoga bersertifikasi RYT-500 dengan pengalaman 8 tahun.'],
      ['Bayu Pratama', 'HIIT & Conditioning', 'Spesialis latihan interval intensitas tinggi dan strength conditioning.'],
      ['Mira Sanjaya', 'Dance & Cardio', 'Koreografer Zumba dan kelas dance cardio.'],
      ['Reza Hakim', 'Functional Strength', 'Pelatih kekuatan fungsional dan powerlifting.'],
    ]],
  )
  console.log('  ✓ 4 instruktur contoh dimasukkan')
}
else {
  console.log('  ↻ instructors sudah berisi data — seed dilewati')
}

if (await rowCount('classes') === 0) {
  const [instr] = await conn.query('SELECT id, nama FROM `instructors` ORDER BY id')
  const idOf = nama => instr.find(i => i.nama === nama)?.id ?? null
  await conn.query(
    `INSERT INTO \`classes\`
      (\`nama\`, \`kategori\`, \`instructor_id\`, \`jadwal\`, \`durasi_menit\`, \`kuota\`, \`intensitas\`)
     VALUES ?`,
    [[
      ['Yoga Flow', 'Mind & Body', idOf('Sari Putri'), 'Sen & Rab · 18:00', 60, 15, 1],
      ['HIIT Burn', 'Cardio', idOf('Bayu Pratama'), 'Jum · 17:30', 45, 20, 3],
      ['Zumba Party', 'Dance', idOf('Mira Sanjaya'), 'Sab · 09:00', 60, 25, 2],
      ['Functional Strength', 'Strength', idOf('Reza Hakim'), 'Sen, Rab, Jum · 06:30', 55, 16, 3],
    ]],
  )
  console.log('  ✓ 4 kelas contoh dimasukkan')
}
else {
  console.log('  ↻ classes sudah berisi data — seed dilewati')
}

await conn.end()
console.log('\nMigrasi modul admin selesai.')
