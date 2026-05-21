import { and, eq, ne } from 'drizzle-orm'
import { users } from '../../../database/schema'

/**
 * Ubah data member: nama, email, dan/atau role.
 * Hanya field yang dikirim yang diperbarui.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = requireIdParam(event)
  const body = await readBody<{ nama?: string, email?: string, role?: string }>(event)
  const db = useDb()

  const target = (
    await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })

  const updates: { nama?: string, email?: string, role?: 'member' | 'admin' | 'owner' } = {}

  if (body?.nama !== undefined) {
    const nama = body.nama.trim()
    if (!nama) throw createError({ statusCode: 400, statusMessage: 'Nama tidak boleh kosong.' })
    updates.nama = nama
  }

  if (body?.email !== undefined) {
    const email = body.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid.' })
    const dup = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1)
    if (dup.length)
      throw createError({ statusCode: 409, statusMessage: 'Email sudah dipakai user lain.' })
    updates.email = email
  }

  if (body?.role !== undefined) {
    if (body.role !== 'member' && body.role !== 'admin' && body.role !== 'owner')
      throw createError({ statusCode: 400, statusMessage: 'Role tidak valid.' })
    // Cegah admin mengunci diri sendiri dengan menurunkan role-nya.
    if (id === admin.id && body.role !== admin.role)
      throw createError({ statusCode: 400, statusMessage: 'Tidak bisa mengubah role akun sendiri.' })
    updates.role = body.role
  }

  if (Object.keys(updates).length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })

  await db.update(users).set(updates).where(eq(users.id, id))
  return { ok: true }
})
