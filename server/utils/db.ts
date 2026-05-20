import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../database/schema'

let pool: mysql.Pool | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

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
    // TiDB Cloud Serverless mewajibkan TLS
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionLimit: 5,
    enableKeepAlive: true,
  })

  db = drizzle(pool, { schema, mode: 'default' })
  return db
}
