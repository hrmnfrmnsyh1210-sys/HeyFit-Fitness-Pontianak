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

// 3) Data contoh — idempoten berdasarkan nama. Aman dijalankan berulang:
//    instruktur/kelas baru ditambah kalau belum ada, kelas tanpa pelatih
//    di-backfill. Data yang sudah diubah admin tidak disentuh.
const SEED_INSTRUCTORS = [
  ['Sari Putri', 'Yoga & Mobility', 'Instruktur yoga bersertifikasi RYT-500 dengan pengalaman 8 tahun.'],
  ['Dini Anjani', 'Pilates & Core', 'Spesialis reformer pilates dan latihan penguatan core.'],
  ['Bayu Pratama', 'HIIT & Conditioning', 'Spesialis latihan interval intensitas tinggi dan strength conditioning.'],
  ['Mira Sanjaya', 'Dance & Cardio', 'Koreografer Zumba dan kelas dance cardio.'],
  ['Reza Hakim', 'Functional Strength', 'Pelatih kekuatan fungsional dan powerlifting.'],
  ['Iwan Setiawan', 'Boxing & Combat', 'Mantan atlet tinju amatir, pelatih boxing fundamentals.'],
]

// nama, kategori, instruktur, jadwal, durasi_menit, kuota, intensitas
const SEED_CLASSES = [
  ['Yoga Flow', 'Mind & Body', 'Sari Putri', 'Sen & Rab · 18:00', 60, 15, 1],
  ['Reformer Pilates', 'Mind & Body', 'Dini Anjani', 'Sel & Kam · 19:00', 50, 12, 2],
  ['HIIT Burn', 'Cardio', 'Bayu Pratama', 'Jum · 17:30', 45, 20, 3],
  ['Zumba Party', 'Dance', 'Mira Sanjaya', 'Sab · 09:00', 60, 25, 2],
  ['Functional Strength', 'Strength', 'Reza Hakim', 'Sen, Rab, Jum · 06:30', 55, 16, 3],
  ['Boxing Fundamentals', 'Cardio', 'Iwan Setiawan', 'Kam & Sab · 18:30', 60, 14, 3],
]

// Instruktur — tambah yang belum ada (dicocokkan berdasarkan nama).
for (const [nama, spesialisasi, bio] of SEED_INSTRUCTORS) {
  const [exist] = await conn.query('SELECT id FROM `instructors` WHERE `nama` = ? LIMIT 1', [nama])
  if (exist.length) continue
  await conn.query(
    'INSERT INTO `instructors` (`nama`, `spesialisasi`, `bio`) VALUES (?, ?, ?)',
    [nama, spesialisasi, bio],
  )
  console.log(`  ✓ instruktur ditambahkan: ${nama}`)
}

// Peta nama instruktur -> id (untuk relasi ke kelas).
const [allInstr] = await conn.query('SELECT id, nama FROM `instructors`')
const instrIdOf = nama => allInstr.find(i => i.nama === nama)?.id ?? null

// Kelas — tambah yang belum ada; backfill instruktur untuk kelas tanpa pelatih.
for (const [nama, kategori, instruktur, jadwal, durasi, kuota, intensitas] of SEED_CLASSES) {
  const instructorId = instrIdOf(instruktur)
  const [exist] = await conn.query(
    'SELECT id, instructor_id FROM `classes` WHERE `nama` = ? LIMIT 1',
    [nama],
  )
  if (!exist.length) {
    await conn.query(
      `INSERT INTO \`classes\`
        (\`nama\`, \`kategori\`, \`instructor_id\`, \`jadwal\`, \`durasi_menit\`, \`kuota\`, \`intensitas\`)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nama, kategori, instructorId, jadwal, durasi, kuota, intensitas],
    )
    console.log(`  ✓ kelas ditambahkan: ${nama} (pelatih: ${instruktur})`)
  }
  else if (exist[0].instructor_id == null && instructorId != null) {
    await conn.query(
      'UPDATE `classes` SET `instructor_id` = ? WHERE `id` = ?',
      [instructorId, exist[0].id],
    )
    console.log(`  ✓ pelatih di-set untuk kelas: ${nama} -> ${instruktur}`)
  }
}

await conn.end()
console.log('\nMigrasi modul admin selesai.')
