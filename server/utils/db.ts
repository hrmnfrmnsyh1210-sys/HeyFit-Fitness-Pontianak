import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../database/schema'

/** Bungkus pembuatan drizzle agar tipe `db` cocok persis dengan hasil panggilan. */
function createDb(connectionPool: mysql.Pool) {
  return drizzle(connectionPool, { schema, mode: 'default' })
}

let pool: mysql.Pool | null = null
let db: ReturnType<typeof createDb> | null = null

/**
 * Koneksi ke TiDB Cloud (MySQL-compatible).
 * Pool dibuat lazy — dev server tetap bisa jalan walau .env belum diisi,
 * error baru muncul saat endpoint auth dipanggil.
 */
export function useDb() {
  if (db) return db

  const { TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE } = process.env

  if (!TIDB_HOST || !TIDB_USER || !TIDB_PASSWORD || !TIDB_DATABASE) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database belum dikonfigurasi. Isi file .env (lihat .env.example).',
    })
  }

  pool = mysql.createPool({
    host: TIDB_HOST,
    port: Number(TIDB_PORT ?? 4000),
    user: TIDB_USER,
    password: TIDB_PASSWORD,
    database: TIDB_DATABASE,
    // TiDB Cloud Serverless mewajibkan TLS. Untuk MySQL lokal (XAMPP/Laragon)
    // set TIDB_SSL=false di .env supaya koneksi tanpa TLS.
    ssl: process.env.TIDB_SSL === 'false' ? undefined : { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionLimit: 5,
    enableKeepAlive: true,
  })

  db = createDb(pool)
  return db
}
