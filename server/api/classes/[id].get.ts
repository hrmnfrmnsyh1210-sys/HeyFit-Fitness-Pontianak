import { and, count, eq } from 'drizzle-orm'
import { bookings, classes, instructors } from '../../database/schema'

/**
 * Detail satu kelas untuk halaman booking.
 * Publik — tapi kalau request datang dari user yang login, ikut mengembalikan
 * `sudahDaftar` (apakah user sudah punya reservasi di kelas ini).
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

  const terisi = Number(
    (await db.select({ n: count() }).from(bookings).where(eq(bookings.classId, id)))[0]?.n ?? 0,
  )

  // Status reservasi user — hanya kalau sedang login.
  let sudahDaftar = false
  const session = await getUserSession(event)
  if (session?.user) {
    const mine = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.classId, id), eq(bookings.userId, session.user.id)))
      .limit(1)
    sudahDaftar = mine.length > 0
  }

  return { data: { ...row, terisi, sudahDaftar } }
})
