import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)

  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  if (!email || !password)
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi.' })

  const db = useDb()

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const user = rows[0]

  // Pesan error sengaja sama untuk email/password agar tidak membocorkan
  // apakah email terdaftar atau tidak.
  if (!user || !(await verifyUserPassword(user.passwordHash, password)))
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah.' })

  const sessionUser = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  }

  await setUserSession(event, { user: sessionUser })
  return { user: sessionUser }
})
