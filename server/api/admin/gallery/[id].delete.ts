import { eq } from 'drizzle-orm'
import { galleries } from '../../../database/schema'

/** Hapus item galeri/berita. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const db = useDb()

  const target = (
    await db.select({ id: galleries.id }).from(galleries).where(eq(galleries.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Item galeri tidak ditemukan.' })

  await db.delete(galleries).where(eq(galleries.id, id))

  return { ok: true }
})
