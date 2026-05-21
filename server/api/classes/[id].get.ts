import { and, count, eq } from 'drizzle-orm'
import { bookings, classes, instructors, payments } from '../../database/schema'

/**
 * Detail satu kelas untuk halaman booking.
 * Publik — kalau request datang dari user yang login, ikut mengembalikan
 * `bookingStatus`: 'terdaftar' (sudah dikonfirmasi), 'menunggu' (bukti
 * transfer masih ditinjau), atau 'none'.
 */
export default defineEventHandler(async (event) => {
  const id = requireIdParam(event)
  const db = useDb()

  const row = (
    await db
      .select({
        id: classes.id,
        nama: classes.nama,
        kategori: classes.kategori,
        jadwal: classes.jadwal,
        durasiMenit: classes.durasiMenit,
        kuota: classes.kuota,
        intensitas: classes.intensitas,
        harga: classes.harga,
        aktif: classes.aktif,
        instrukturNama: instructors.nama,
        instrukturSpesialisasi: instructors.spesialisasi,
        instrukturBio: instructors.bio,
      })
      .from(classes)
      .leftJoin(instructors, eq(classes.instructorId, instructors.id))
      .where(eq(classes.id, id))
      .limit(1)
  )[0]

  if (!row || !row.aktif)
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

  const terkonfirmasi = Number(
    (await db.select({ n: count() }).from(bookings).where(eq(bookings.classId, id)))[0]?.n ?? 0,
  )
  const menunggu = Number(
    (
      await db
        .select({ n: count() })
        .from(payments)
        .where(and(
          eq(payments.jenis, 'kelas'),
          eq(payments.classId, id),
          eq(payments.status, 'menunggu'),
        ))
    )[0]?.n ?? 0,
  )

  // Status booking user — hanya kalau sedang login.
  let bookingStatus: 'none' | 'menunggu' | 'terdaftar' = 'none'
  const session = await getUserSession(event)
  if (session?.user) {
    const sudah = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.classId, id), eq(bookings.userId, session.user.id)))
      .limit(1)
    if (sudah.length) {
      bookingStatus = 'terdaftar'
    }
    else {
      const pending = await db
        .select({ id: payments.id })
        .from(payments)
        .where(and(
          eq(payments.jenis, 'kelas'),
          eq(payments.classId, id),
          eq(payments.userId, session.user.id),
          eq(payments.status, 'menunggu'),
        ))
        .limit(1)
      if (pending.length) bookingStatus = 'menunggu'
    }
  }

  return { data: { ...row, terisi: terkonfirmasi + menunggu, bookingStatus } }
})
