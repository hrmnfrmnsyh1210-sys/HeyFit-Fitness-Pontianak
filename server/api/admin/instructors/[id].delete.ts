import { eq } from 'drizzle-orm'
import { classes, instructors } from '../../../database/schema'

/**
 * Hapus instruktur. Kelas yang memakainya tidak ikut terhapus —
 * instructorId-nya hanya dikosongkan supaya tidak jadi referensi mati.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const db = useDb()

  const target = (
    await db.select({ id: instructors.id }).from(instructors).where(eq(instructors.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Instruktur tidak ditemukan.' })

  await db.update(classes).set({ instructorId: null }).where(eq(classes.instructorId, id))
  await db.delete(instructors).where(eq(instructors.id, id))

  return { ok: true }
})
