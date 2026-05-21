import { eq } from 'drizzle-orm'
import { attendances, memberships, users } from '../../../database/schema'

/**
 * Hapus member beserta data turunannya (membership & kehadiran).
 * Relasi dijaga di level aplikasi, jadi turunan dihapus manual lebih dulu.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = requireIdParam(event)

  if (id === admin.id)
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus akun sendiri.' })

  const db = useDb()
  const target = (
    await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })

  await db.delete(attendances).where(eq(attendances.userId, id))
  await db.delete(memberships).where(eq(memberships.userId, id))
  await db.delete(users).where(eq(users.id, id))

  return { ok: true }
})
