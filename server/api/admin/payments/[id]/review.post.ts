import { and, count, eq } from 'drizzle-orm'
import { bookings, classes, payments } from '../../../../database/schema'

/**
 * Tinjau satu pengajuan pembayaran — setujui atau tolak.
 * Body: { action: 'approve' | 'reject', catatan?: string }
 *
 * Saat disetujui:
 * - jenis 'membership' -> membership user diaktifkan/diperpanjang
 * - jenis 'kelas'      -> baris booking dibuat (member resmi terdaftar)
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = requireIdParam(event)
  const body = await readBody<{ action?: string, catatan?: string }>(event)
  const db = useDb()

  const action = body?.action
  if (action !== 'approve' && action !== 'reject')
    throw createError({ statusCode: 400, statusMessage: 'Aksi tidak valid.' })

  const catatan = parseCatatan(body?.catatan)

  const payment = (
    await db.select().from(payments).where(eq(payments.id, id)).limit(1)
  )[0]
  if (!payment)
    throw createError({ statusCode: 404, statusMessage: 'Pengajuan tidak ditemukan.' })
  if (payment.status !== 'menunggu')
    throw createError({ statusCode: 409, statusMessage: 'Pengajuan ini sudah ditinjau.' })

  if (action === 'approve') {
    if (payment.jenis === 'membership') {
      if (!isPaket(payment.paket))
        throw createError({ statusCode: 400, statusMessage: 'Paket pada pengajuan tidak valid.' })
      await applyMembership(payment.userId, payment.paket)
    }
    else {
      const classId = payment.classId
      if (classId == null)
        throw createError({ statusCode: 400, statusMessage: 'Kelas pada pengajuan tidak valid.' })

      const kelas = (
        await db
          .select({ id: classes.id, kuota: classes.kuota })
          .from(classes)
          .where(eq(classes.id, classId))
          .limit(1)
      )[0]
      if (!kelas)
        throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

      // Buat booking kalau member belum terdaftar di kelas ini.
      const sudah = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(and(eq(bookings.classId, classId), eq(bookings.userId, payment.userId)))
        .limit(1)
      if (!sudah.length) {
        const terisi = Number(
          (await db.select({ n: count() }).from(bookings).where(eq(bookings.classId, classId)))[0]?.n ?? 0,
        )
        if (terisi >= kelas.kuota) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Kuota kelas sudah penuh. Tolak pengajuan ini atau tambah kuota kelas dulu.',
          })
        }
        try {
          await db.insert(bookings).values({ classId, userId: payment.userId })
        }
        catch {
          // Unique (class_id, user_id) — booking sudah ada, abaikan.
        }
      }
    }
  }

  await db
    .update(payments)
    .set({
      status: action === 'approve' ? 'disetujui' : 'ditolak',
      catatanAdmin: catatan,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    })
    .where(eq(payments.id, id))

  return { ok: true }
})
