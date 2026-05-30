import { and, asc, count, eq } from 'drizzle-orm'
import { bookings, classes, instructors, payments } from '../../database/schema'

/**
 * Daftar kelas aktif untuk halaman publik /kelas.
 * `terisi` = booking yang sudah dikonfirmasi + pengajuan pembayaran yang
 * masih menunggu (slot ditahan selama menunggu konfirmasi admin).
 */
export default defineEventHandler(async () => {
  const db = useDb()

  const rows = await db
    .select({
      id: classes.id,
      nama: classes.nama,
      kategori: classes.kategori,
      jadwal: classes.jadwal,
      durasiMenit: classes.durasiMenit,
      kuota: classes.kuota,
      intensitas: classes.intensitas,
      harga: classes.harga,
      instrukturNama: instructors.nama,
      instrukturSpesialisasi: instructors.spesialisasi,
    })
    .from(classes)
    .leftJoin(instructors, eq(classes.instructorId, instructors.id))
    .where(eq(classes.aktif, true))
    .orderBy(asc(classes.nama))

  // Booking aktif (belum kedaluwarsa) per kelas.
  const bookingCounts = await db
    .select({ classId: bookings.classId, n: count() })
    .from(bookings)
    .where(bookingAktifCond())
    .groupBy(bookings.classId)

  // Pengajuan pembayaran kelas yang masih menunggu konfirmasi.
  const pendingCounts = await db
    .select({ classId: payments.classId, n: count() })
    .from(payments)
    .where(and(eq(payments.jenis, 'kelas'), eq(payments.status, 'menunggu')))
    .groupBy(payments.classId)

  const terisiMap = new Map<number, number>()
  for (const r of bookingCounts)
    terisiMap.set(r.classId, (terisiMap.get(r.classId) ?? 0) + Number(r.n))
  for (const r of pendingCounts) {
    if (r.classId != null)
      terisiMap.set(r.classId, (terisiMap.get(r.classId) ?? 0) + Number(r.n))
  }

  return {
    data: rows.map(r => ({ ...r, terisi: terisiMap.get(r.id) ?? 0 })),
  }
})
