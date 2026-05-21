import { desc, eq } from 'drizzle-orm'
import { classes, payments } from '../../database/schema'

/**
 * Daftar pengajuan pembayaran milik member yang sedang login.
 * Bukti transfer (base64) sengaja tidak disertakan agar payload ringan.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const db = useDb()

  const data = await db
    .select({
      id: payments.id,
      jenis: payments.jenis,
      paket: payments.paket,
      classId: payments.classId,
      kelasNama: classes.nama,
      nominal: payments.nominal,
      metode: payments.metode,
      status: payments.status,
      catatanAdmin: payments.catatanAdmin,
      createdAt: payments.createdAt,
      reviewedAt: payments.reviewedAt,
    })
    .from(payments)
    .leftJoin(classes, eq(payments.classId, classes.id))
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.id))

  return { data }
})
