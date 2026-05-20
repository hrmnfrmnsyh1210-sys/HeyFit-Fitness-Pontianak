import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<{ nama?: string, email?: string, password?: string }>(event)

  const nama = body?.nama?.trim() ?? ''
  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  if (nama.length < 2)
    throw createError({ statusCode: 400, statusMessage: 'Nama minimal 2 karakter.' })
  if (!EMAIL_RE.test(email))
    throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid.' })
  if (password.length < 6)
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 6 karakter.' })

  const db = useDb()

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing.length)
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar.' })

  const passwordHash = await hashUserPassword(password)

  // Pendaftaran publik selalu role 'member'. Admin/owner dibuat via seed.
  const [result] = await db.insert(users).values({ nama, email, passwordHash, role: 'member' })

  const sessionUser = {
    id: Number(result.insertId),
    nama,
    email,
    role: 'member' as const,
  }

  await setUserSession(event, { user: sessionUser })
  return { user: sessionUser }
})
