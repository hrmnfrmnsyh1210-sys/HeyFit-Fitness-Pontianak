import { eq } from 'drizzle-orm'
import { classes, instructors, type KategoriKelas } from '../../../database/schema'

const KATEGORI: KategoriKelas[] = ['Mind & Body', 'Cardio', 'Strength', 'Dance']

/** Buat kelas baru. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, unknown>>(event)
  const db = useDb()

  const nama = String(body?.nama ?? '').trim()
  const kategori = body?.kategori
  const jadwal = String(body?.jadwal ?? '').trim()
  const durasiMenit = Number(body?.durasiMenit)
  const kuota = Number(body?.kuota)
  const intensitas = Number(body?.intensitas)
  const instructorId
    = body?.instructorId == null || body.instructorId === '' ? null : Number(body.instructorId)

  if (!nama)
    throw createError({ statusCode: 400, statusMessage: 'Nama kelas wajib diisi.' })
  if (!KATEGORI.includes(kategori as KategoriKelas))
    throw createError({ statusCode: 400, statusMessage: 'Kategori tidak valid.' })
  if (!jadwal)
    throw createError({ statusCode: 400, statusMessage: 'Jadwal wajib diisi.' })
  if (!Number.isInteger(durasiMenit) || durasiMenit <= 0)
    throw createError({ statusCode: 400, statusMessage: 'Durasi tidak valid.' })
  if (!Number.isInteger(kuota) || kuota <= 0)
    throw createError({ statusCode: 400, statusMessage: 'Kuota tidak valid.' })
  if (![1, 2, 3].includes(intensitas))
    throw createError({ statusCode: 400, statusMessage: 'Intensitas harus 1–3.' })

  if (instructorId !== null) {
    if (!Number.isInteger(instructorId))
      throw createError({ statusCode: 400, statusMessage: 'Instruktur tidak valid.' })
    const exist = await db
      .select({ id: instructors.id })
      .from(instructors)
      .where(eq(instructors.id, instructorId))
      .limit(1)
    if (!exist.length)
      throw createError({ statusCode: 400, statusMessage: 'Instruktur tidak ditemukan.' })
  }

  await db.insert(classes).values({
    nama,
    kategori: kategori as KategoriKelas,
    jadwal,
    durasiMenit,
    kuota,
    intensitas,
    instructorId,
    aktif: body?.aktif === undefined ? true : Boolean(body.aktif),
  })

  return { ok: true }
})
