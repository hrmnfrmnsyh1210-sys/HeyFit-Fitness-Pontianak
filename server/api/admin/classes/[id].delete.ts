import { eq } from 'drizzle-orm'
import { classes } from '../../../database/schema'

/** Hapus kelas. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const db = useDb()

  const target = (
    await db.select({ id: classes.id }).from(classes).where(eq(classes.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

  await db.delete(classes).where(eq(classes.id, id))
  return { ok: true }
})
