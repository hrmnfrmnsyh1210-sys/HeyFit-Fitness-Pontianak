import { instructors } from '../../../database/schema'

/** Buat instruktur baru. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event)

  const nama = String(body?.nama ?? '').trim()
  const spesialisasi = String(body?.spesialisasi ?? '').trim()
  const bio = body?.bio == null ? null : String(body.bio).trim() || null

  if (!nama)
    throw createError({ statusCode: 400, statusMessage: 'Nama instruktur wajib diisi.' })
  if (!spesialisasi)
    throw createError({ statusCode: 400, statusMessage: 'Spesialisasi wajib diisi.' })
  if (bio && bio.length > 400)
    throw createError({ statusCode: 400, statusMessage: 'Bio maksimal 400 karakter.' })

  const db = useDb()
  await db.insert(instructors).values({
    nama,
    spesialisasi,
    bio,
    aktif: body?.aktif === undefined ? true : Boolean(body.aktif),
  })

  return { ok: true }
})
