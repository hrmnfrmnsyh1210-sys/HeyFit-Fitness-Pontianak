import { desc, eq } from 'drizzle-orm'
import { classes, payments, users } from '../../../database/schema'

const STATUS = ['menunggu', 'disetujui', 'ditolak'] as const
type StatusBayar = (typeof STATUS)[number]

/**
 * Daftar pengajuan pembayaran untuk ditinjau admin.
 * Query `?status=menunggu|disetujui|ditolak` (default: menunggu).
 * Menyertakan bukti transfer (base64) supaya admin bisa langsung memeriksa.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const raw = String(getQuery(event).status ?? 'menunggu')
  const status: StatusBayar = (STATUS as readonly string[]).includes(raw)
    ? (raw as StatusBayar)
    : 'menunggu'

  const data = await db
    .select({
      id: payments.id,
      userId: payments.userId,
      userNama: users.nama,
      userEmail: users.email,
      jenis: payments.jenis,
      paket: payments.paket,
      classId: payments.classId,
      kelasNama: classes.nama,
      nominal: payments.nominal,
      metode: payments.metode,
      buktiTransfer: payments.buktiTransfer,
      catatan: payments.catatan,
      status: payments.status,
      catatanAdmin: payments.catatanAdmin,
      createdAt: payments.createdAt,
      reviewedAt: payments.reviewedAt,
    })
    .from(payments)
    .leftJoin(users, eq(payments.userId, users.id))
    .leftJoin(classes, eq(payments.classId, classes.id))
    .where(eq(payments.status, status))
    .orderBy(desc(payments.id))

  return { data, status }
})
