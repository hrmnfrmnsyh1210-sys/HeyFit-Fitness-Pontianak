/**
 * Seed akun staff (admin & owner).
 * Jalankan: npm run db:seed
 *
 * Idempotent — kalau email sudah ada, password & role-nya di-update.
 * GANTI password default di bawah ini sebelum dipakai production.
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { eq } from 'drizzle-orm'
import { users } from './schema'
import { hashUserPassword } from '../utils/password'

const staffAccounts = [
  { nama: 'Owner Heyfit', email: 'owner@heyfit.id', password: 'owner123', role: 'owner' as const },
  { nama: 'Admin Heyfit', email: 'admin@heyfit.id', password: 'admin123', role: 'admin' as const },
]

async function main() {
  const { TIDB_HOST, TIDB_PORT, TIDB_USER, TIDB_PASSWORD, TIDB_DATABASE } = process.env

  if (!TIDB_HOST || !TIDB_USER || !TIDB_PASSWORD || !TIDB_DATABASE) {
    console.error('✘ Konfigurasi TiDB belum lengkap. Isi file .env dulu.')
    process.exit(1)
  }

  const pool = mysql.createPool({
    host: TIDB_HOST,
    port: Number(TIDB_PORT ?? 4000),
    user: TIDB_USER,
    password: TIDB_PASSWORD,
    database: TIDB_DATABASE,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  })
  const db = drizzle(pool)

  console.log('Seeding akun staff...\n')

  for (const acc of staffAccounts) {
    const passwordHash = await hashUserPassword(acc.password)
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, acc.email))
      .limit(1)

    if (existing.length) {
      await db
        .update(users)
        .set({ nama: acc.nama, passwordHash, role: acc.role })
        .where(eq(users.email, acc.email))
      console.log(`  ↻ updated  ${acc.role.padEnd(6)} ${acc.email}`)
    }
    else {
      await db.insert(users).values({
        nama: acc.nama,
        email: acc.email,
        passwordHash,
        role: acc.role,
      })
      console.log(`  ✓ created  ${acc.role.padEnd(6)} ${acc.email}`)
    }
  }

  await pool.end()
  console.log('\nSeed selesai. Password default:')
  for (const acc of staffAccounts)
    console.log(`  ${acc.email}  /  ${acc.password}`)
}

main().catch((err) => {
  console.error('✘ Seed gagal:', err)
  process.exit(1)
})
