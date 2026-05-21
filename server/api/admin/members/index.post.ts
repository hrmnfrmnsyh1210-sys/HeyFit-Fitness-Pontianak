import { eq } from 'drizzle-orm'
import { users } from '../../../database/schema'

/**
 * Buat akun baru dari dashboard admin.
 * Body: { nama, email, password, role? }
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ nama?: string, email?: string, password?: string, role?: string }>(event)

  const nama = body?.nama?.trim() ?? ''
  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''
  const role = body?.role === 'admin' || body?.role === 'owner' ? body.role : 'member'

  if (!nama || !email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, dan password wajib diisi.' })
  if (password.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid.' })

  const db = useDb()
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (existing.length)
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar.' })

  const passwordHash = await hashUserPassword(password)
  await db.insert(users).values({ nama, email, passwordHash, role })

  return { ok: true }
})
