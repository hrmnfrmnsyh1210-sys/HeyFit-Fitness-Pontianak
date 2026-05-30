import { desc, eq } from 'drizzle-orm'
import { bookings, classes, instructors } from '../../database/schema'

/** Daftar kelas yang sudah dibooking member yang sedang login. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDb()

  const data = await db
    .select({
      bookingId: bookings.id,
      classId: classes.id,
      nama: classes.nama,
      kategori: classes.kategori,
      jadwal: classes.jadwal,
      durasiMenit: classes.durasiMenit,
      instrukturNama: instructors.nama,
      berlakuSampai: bookings.berlakuSampai,
      bookedAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(classes, eq(bookings.classId, classes.id))
    .leftJoin(instructors, eq(classes.instructorId, instructors.id))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.id))

  // Sertakan status & sisa hari supaya tampilan member bisa menandai yang habis.
  const enriched = data.map(b => ({
    ...b,
    aktif: bookingMasihAktif(b.berlakuSampai),
    sisaHari: b.berlakuSampai == null ? null : daysUntil(b.berlakuSampai),
  }))

  return { data: enriched }
})
