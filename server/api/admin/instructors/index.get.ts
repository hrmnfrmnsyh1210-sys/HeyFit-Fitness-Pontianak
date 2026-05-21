import { count, desc, eq } from 'drizzle-orm'
import { classes, instructors } from '../../../database/schema'

/** Daftar instruktur + jumlah kelas yang dipegang masing-masing. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const rows = await db.select().from(instructors).orderBy(desc(instructors.id))

  const kelasCount = await db
    .select({ instructorId: classes.instructorId, n: count() })
    .from(classes)
    .groupBy(classes.instructorId)
  const countMap = new Map(kelasCount.map(r => [r.instructorId, Number(r.n)]))

  return {
    data: rows.map(r => ({ ...r, jumlahKelas: countMap.get(r.id) ?? 0 })),
  }
})
