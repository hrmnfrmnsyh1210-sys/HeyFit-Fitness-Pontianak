import { and, count, eq } from 'drizzle-orm'
import { bookings, classes } from '../../../database/schema'

/**
 * Buat reservasi kelas untuk member yang sedang login.
 * Validasi: kelas ada & aktif, belum terdaftar, dan kuota belum penuh.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = requireIdParam(event)
  const db = useDb()

  const kelas = (
    await db
      .select({ id: classes.id, kuota: classes.kuota, aktif: classes.aktif })
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1)
  )[0]

  if (!kelas || !kelas.aktif)
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

  const existing = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.classId, id), eq(bookings.userId, user.id)))
    .limit(1)
  if (existing.length)
    throw createError({ statusCode: 409, statusMessage: 'Kamu sudah terdaftar di kelas ini.' })

  const terisi = Number(
    (await db.select({ n: count() }).from(bookings).where(eq(bookings.classId, id)))[0]?.n ?? 0,
  )
  if (terisi >= kelas.kuota)
    throw createError({ statusCode: 409, statusMessage: 'Kuota kelas sudah penuh.' })

  try {
    await db.insert(bookings).values({ classId: id, userId: user.id })
  }
  catch {
    // Unique index (class_id, user_id) menangkap race condition booking ganda.
    throw createError({ statusCode: 409, statusMessage: 'Kamu sudah terdaftar di kelas ini.' })
  }

  return { ok: true }
})
