import { and, eq } from 'drizzle-orm'
import { payments } from '../../../database/schema'

/**
 * Batalkan pengajuan booking kelas yang masih menunggu konfirmasi.
 * Booking yang sudah dikonfirmasi (sudah dibayar) tidak bisa dibatalkan
 * sendiri oleh member — hubungi admin.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = requireIdParam(event)
  const db = useDb()

  await db
    .delete(payments)
    .where(and(
      eq(payments.userId, user.id),
      eq(payments.jenis, 'kelas'),
      eq(payments.classId, id),
      eq(payments.status, 'menunggu'),
    ))

  return { ok: true }
})
