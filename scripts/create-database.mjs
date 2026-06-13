/**
 * Membuat database di TiDB Cloud sesuai TIDB_DATABASE di .env.
 * Jalankan: npm run db:create
 *
 * Konek tanpa memilih database dulu (database belum tentu ada),
 * lalu CREATE DATABASE IF NOT EXISTS.
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
  // MySQL lokal: set TIDB_SSL=false di .env untuk koneksi tanpa TLS.
  ssl: process.env.TIDB_SSL === 'false' ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
})

await conn.query(`CREATE DATABASE IF NOT EXISTS \`${TIDB_DATABASE}\``)
console.log(`✓ Database "${TIDB_DATABASE}" siap digunakan.`)

await conn.end()
