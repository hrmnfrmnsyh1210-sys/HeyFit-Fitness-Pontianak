import { eq } from 'drizzle-orm'
import { galleries, type NewGallery } from '../../../database/schema'

/** Ubah item galeri — termasuk dipakai untuk toggle tampil/sembunyi. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = useDb()

  const target = (
    await db.select({ id: galleries.id }).from(galleries).where(eq(galleries.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Item galeri tidak ditemukan.' })

  const updates: Partial<NewGallery> = {}

  if (body?.judul !== undefined) {
    const v = String(body.judul).trim()
    if (!v) throw createError({ statusCode: 400, statusMessage: 'Judul tidak boleh kosong.' })
    if (v.length > 160) throw createError({ statusCode: 400, statusMessage: 'Judul maksimal 160 karakter.' })
    updates.judul = v
  }
  if (body?.kategori !== undefined) {
    const v = String(body.kategori).trim() || 'Berita'
    if (v.length > 60) throw createError({ statusCode: 400, statusMessage: 'Kategori maksimal 60 karakter.' })
    updates.kategori = v
  }
  if (body?.ringkasan !== undefined) {
    const v = body.ringkasan == null ? null : String(body.ringkasan).trim() || null
    if (v && v.length > 300)
      throw createError({ statusCode: 400, statusMessage: 'Ringkasan maksimal 300 karakter.' })
    updates.ringkasan = v
  }
  if (body?.konten !== undefined)
    updates.konten = body.konten == null ? null : String(body.konten).trim() || null
  if (body?.gambar !== undefined) {
    const v = String(body.gambar).trim()
    if (!v.startsWith('data:image/'))
      throw createError({ statusCode: 400, statusMessage: 'Foto tidak valid.' })
    updates.gambar = v
  }
  if (body?.tampil !== undefined)
    updates.tampil = Boolean(body.tampil)

  if (Object.keys(updates).length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })

  await db.update(galleries).set(updates).where(eq(galleries.id, id))
  return { ok: true }
})
