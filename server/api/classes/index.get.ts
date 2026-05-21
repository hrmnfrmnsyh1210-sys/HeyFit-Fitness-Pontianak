import { asc, count, eq } from 'drizzle-orm'
import { bookings, classes, instructors } from '../../database/schema'

/**
 * Daftar kelas aktif untuk halaman publik /kelas.
 * Termasuk nama pelatih (personal trainer) dan jumlah slot yang sudah terisi
 * (dihitung nyata dari tabel bookings). Tidak butuh login.
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
      instrukturNama: instructors.nama,
      instrukturSpesialisasi: instructors.spesialisasi,
    })
    .from(classes)
    .leftJoin(instructors, eq(classes.instructorId, instructors.id))
    .where(eq(classes.aktif, true))
    .orderBy(asc(classes.nama))

  const counts = await db
    .select({ classId: bookings.classId, n: count() })
    .from(bookings)
    .groupBy(bookings.classId)
  const terisiMap = new Map(counts.map(c => [c.classId, Number(c.n)]))

  return {
    data: rows.map(r => ({ ...r, terisi: terisiMap.get(r.id) ?? 0 })),
  }
})
