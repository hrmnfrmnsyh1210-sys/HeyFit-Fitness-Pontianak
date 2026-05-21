import { eq } from 'drizzle-orm'
import { instructors, type NewInstructor } from '../../../database/schema'

/** Ubah instruktur — termasuk dipakai untuk toggle status aktif. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = useDb()

  const target = (
    await db.select({ id: instructors.id }).from(instructors).where(eq(instructors.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Instruktur tidak ditemukan.' })

  const updates: Partial<NewInstructor> = {}

  if (body?.nama !== undefined) {
    const v = String(body.nama).trim()
    if (!v) throw createError({ statusCode: 400, statusMessage: 'Nama tidak boleh kosong.' })
    updates.nama = v
  }
  if (body?.spesialisasi !== undefined) {
    const v = String(body.spesialisasi).trim()
    if (!v) throw createError({ statusCode: 400, statusMessage: 'Spesialisasi tidak boleh kosong.' })
    updates.spesialisasi = v
  }
  if (body?.bio !== undefined) {
    const v = body.bio == null ? null : String(body.bio).trim() || null
    if (v && v.length > 400)
      throw createError({ statusCode: 400, statusMessage: 'Bio maksimal 400 karakter.' })
    updates.bio = v
  }
  if (body?.aktif !== undefined)
    updates.aktif = Boolean(body.aktif)

  if (Object.keys(updates).length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })

  await db.update(instructors).set(updates).where(eq(instructors.id, id))
  return { ok: true }
})
