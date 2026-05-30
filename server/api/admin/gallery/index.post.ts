import { galleries } from '../../../database/schema'

/** Buat item galeri/berita baru. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event)

  const judul = String(body?.judul ?? '').trim()
  const kategori = String(body?.kategori ?? '').trim() || 'Berita'
  const ringkasan = body?.ringkasan == null ? null : String(body.ringkasan).trim() || null
  const konten = body?.konten == null ? null : String(body.konten).trim() || null
  const gambar = String(body?.gambar ?? '').trim()

  if (!judul)
    throw createError({ statusCode: 400, statusMessage: 'Judul wajib diisi.' })
  if (judul.length > 160)
    throw createError({ statusCode: 400, statusMessage: 'Judul maksimal 160 karakter.' })
  if (kategori.length > 60)
    throw createError({ statusCode: 400, statusMessage: 'Kategori maksimal 60 karakter.' })
  if (ringkasan && ringkasan.length > 300)
    throw createError({ statusCode: 400, statusMessage: 'Ringkasan maksimal 300 karakter.' })
  if (!gambar.startsWith('data:image/'))
    throw createError({ statusCode: 400, statusMessage: 'Foto wajib diunggah.' })

  const db = useDb()
  await db.insert(galleries).values({
    judul,
    kategori,
    ringkasan,
    konten,
    gambar,
    tampil: body?.tampil === undefined ? true : Boolean(body.tampil),
  })

  return { ok: true }
})
