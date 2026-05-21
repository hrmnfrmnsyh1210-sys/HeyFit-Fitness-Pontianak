import { desc, eq } from 'drizzle-orm'
import { classes, instructors } from '../../../database/schema'

/** Daftar semua kelas + nama instrukturnya. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const data = await db
    .select({
      id: classes.id,
      nama: classes.nama,
      kategori: classes.kategori,
      instructorId: classes.instructorId,
      instrukturNama: instructors.nama,
      jadwal: classes.jadwal,
      durasiMenit: classes.durasiMenit,
      kuota: classes.kuota,
      intensitas: classes.intensitas,
      harga: classes.harga,
      aktif: classes.aktif,
      createdAt: classes.createdAt,
    })
    .from(classes)
    .leftJoin(instructors, eq(classes.instructorId, instructors.id))
    .orderBy(desc(classes.id))

  return { data }
})
