import { desc } from 'drizzle-orm'
import { galleries } from '../../../database/schema'

/** Daftar semua item galeri/berita (termasuk yang disembunyikan). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const rows = await db.select().from(galleries).orderBy(desc(galleries.id))

  return { data: rows }
})
