import { eq } from 'drizzle-orm'
import { classes, instructors, type KategoriKelas, type NewGymClass } from '../../../database/schema'

const KATEGORI: KategoriKelas[] = ['Mind & Body', 'Cardio', 'Strength', 'Dance']

/** Ubah kelas — termasuk dipakai untuk toggle status aktif. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = useDb()

  const target = (
    await db.select({ id: classes.id }).from(classes).where(eq(classes.id, id)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

  const updates: Partial<NewGymClass> = {}

  if (body?.nama !== undefined) {
    const v = String(body.nama).trim()
    if (!v) throw createError({ statusCode: 400, statusMessage: 'Nama kelas tidak boleh kosong.' })
    updates.nama = v
  }
  if (body?.kategori !== undefined) {
    if (!KATEGORI.includes(body.kategori as KategoriKelas))
      throw createError({ statusCode: 400, statusMessage: 'Kategori tidak valid.' })
    updates.kategori = body.kategori as KategoriKelas
  }
  if (body?.jadwal !== undefined) {
    const v = String(body.jadwal).trim()
    if (!v) throw createError({ statusCode: 400, statusMessage: 'Jadwal tidak boleh kosong.' })
    updates.jadwal = v
  }
  if (body?.durasiMenit !== undefined) {
    const v = Number(body.durasiMenit)
    if (!Number.isInteger(v) || v <= 0)
      throw createError({ statusCode: 400, statusMessage: 'Durasi tidak valid.' })
    updates.durasiMenit = v
  }
  if (body?.kuota !== undefined) {
    const v = Number(body.kuota)
    if (!Number.isInteger(v) || v <= 0)
      throw createError({ statusCode: 400, statusMessage: 'Kuota tidak valid.' })
    updates.kuota = v
  }
  if (body?.intensitas !== undefined) {
    const v = Number(body.intensitas)
    if (![1, 2, 3].includes(v))
      throw createError({ statusCode: 400, statusMessage: 'Intensitas harus 1–3.' })
    updates.intensitas = v
  }
  if (body?.harga !== undefined) {
    const v = Number(body.harga)
    if (!Number.isInteger(v) || v < 0)
      throw createError({ statusCode: 400, statusMessage: 'Harga tidak valid.' })
    updates.harga = v
  }
  if (body?.instructorId !== undefined) {
    const iid
      = body.instructorId == null || body.instructorId === '' ? null : Number(body.instructorId)
    if (iid !== null) {
      if (!Number.isInteger(iid))
        throw createError({ statusCode: 400, statusMessage: 'Instruktur tidak valid.' })
      const exist = await db
        .select({ id: instructors.id })
        .from(instructors)
        .where(eq(instructors.id, iid))
        .limit(1)
      if (!exist.length)
        throw createError({ statusCode: 400, statusMessage: 'Instruktur tidak ditemukan.' })
    }
    updates.instructorId = iid
  }
  if (body?.aktif !== undefined)
    updates.aktif = Boolean(body.aktif)

  if (Object.keys(updates).length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada perubahan.' })

  await db.update(classes).set(updates).where(eq(classes.id, id))
  return { ok: true }
})
