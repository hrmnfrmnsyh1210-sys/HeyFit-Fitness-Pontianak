import { eq } from 'drizzle-orm'
import { bookings, classes } from '../../../database/schema'

/**
 * Hapus kelas. Reservasi (bookings) yang menempel ikut dihapus
 * supaya tidak jadi baris yatim.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const db = useDb()

  const target = (
    await db.select({ id: classes.id }).from(classes).where(eq(classes.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

  await db.delete(bookings).where(eq(bookings.classId, id))
  await db.delete(classes).where(eq(classes.id, id))
  return { ok: true }
})
