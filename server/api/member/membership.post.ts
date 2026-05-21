import { and, eq } from 'drizzle-orm'
import { payments } from '../../database/schema'

/**
 * Pengajuan pembayaran membership untuk user yang sedang login.
 * Body: { paket, buktiTransfer (data URL gambar), metode?, catatan? }
 *
 * Tidak langsung mengaktifkan membership — hanya membuat pengajuan
 * berstatus 'menunggu'. Membership aktif setelah admin menyetujui bukti
 * transfer (lihat /api/admin/payments/[id]/review).
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody<Record<string, unknown>>(event)

  const paket = body?.paket
  if (!isPaket(paket))
    throw createError({ statusCode: 400, statusMessage: 'Paket tidak valid.' })

  const buktiTransfer = validateBuktiTransfer(body?.buktiTransfer)
  const catatan = parseCatatan(body?.catatan)

  const db = useDb()

  // Cegah pengajuan ganda yang masih menunggu.
  const pending = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(
      eq(payments.userId, user.id),
      eq(payments.jenis, 'membership'),
      eq(payments.status, 'menunggu'),
    ))
    .limit(1)
  if (pending.length) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Kamu masih punya pengajuan membership yang menunggu konfirmasi.',
    })
  }

  const nominal = PAKET_HARGA[paket]

  await db.insert(payments).values({
    userId: user.id,
    jenis: 'membership',
    paket,
    nominal,
    buktiTransfer,
    catatan,
    status: 'menunggu',
  })

  return { ok: true, nominal, paket }
})
