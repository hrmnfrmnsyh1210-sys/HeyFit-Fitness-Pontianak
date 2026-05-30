import { desc, eq } from 'drizzle-orm'
import { galleries } from '../../database/schema'

/**
 * Galeri/berita publik untuk landing page — hanya item yang ditampilkan
 * (tampil = true), terbaru dulu. `limit` opsional (mis. ?limit=6).
 */
export default defineEventHandler(async (event) => {
  const db = useDb()
  const q = getQuery(event)
  const limit = Math.min(Math.max(Number(q.limit) || 12, 1), 50)

  const rows = await db
    .select({
      id: galleries.id,
      judul: galleries.judul,
      kategori: galleries.kategori,
      ringkasan: galleries.ringkasan,
      konten: galleries.konten,
      gambar: galleries.gambar,
      createdAt: galleries.createdAt,
    })
    .from(galleries)
    .where(eq(galleries.tampil, true))
    .orderBy(desc(galleries.id))
    .limit(limit)

  return { data: rows }
})
