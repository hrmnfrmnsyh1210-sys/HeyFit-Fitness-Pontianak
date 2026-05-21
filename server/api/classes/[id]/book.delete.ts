import { and, eq } from 'drizzle-orm'
import { bookings } from '../../../database/schema'

/** Batalkan reservasi kelas milik member yang sedang login. */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = requireIdParam(event)
  const db = useDb()

  await db
    .delete(bookings)
    .where(and(eq(bookings.classId, id), eq(bookings.userId, user.id)))

  return { ok: true }
})
