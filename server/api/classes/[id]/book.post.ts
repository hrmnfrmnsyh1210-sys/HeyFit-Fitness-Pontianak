import { and, count, eq } from 'drizzle-orm'
import { bookings, classes, payments } from '../../../database/schema'

/**
 * Pengajuan booking sebuah kelas.
 * Body: { buktiTransfer (data URL gambar), metode?, catatan? }
 *
 * - Kelas berbayar -> dibuat pengajuan pembayaran berstatus 'menunggu';
 *   member resmi terdaftar setelah admin menyetujui bukti transfer.
 * - Kelas gratis (harga 0) -> langsung terdaftar tanpa pembayaran.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = requireIdParam(event)
  const db = useDb()

  const kelas = (
    await db
      .select({
        id: classes.id,
        harga: classes.harga,
        kuota: classes.kuota,
        aktif: classes.aktif,
        masaBerlakuHari: classes.masaBerlakuHari,
      })
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1)
  )[0]
  if (!kelas || !kelas.aktif)
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })

  // Booking yang sudah ada (untuk cek aktif vs kedaluwarsa).
  const existingBooking = (
    await db
      .select({ id: bookings.id, berlakuSampai: bookings.berlakuSampai })
      .from(bookings)
      .where(and(eq(bookings.classId, id), eq(bookings.userId, user.id)))
      .limit(1)
  )[0]
  // Masih terdaftar & belum kedaluwarsa -> tidak bisa booking lagi.
  if (existingBooking && bookingMasihAktif(existingBooking.berlakuSampai))
    throw createError({ statusCode: 409, statusMessage: 'Kamu masih terdaftar aktif di kelas ini.' })

  // Sudah punya pengajuan yang menunggu?
  const pendingMine = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(
      eq(payments.userId, user.id),
      eq(payments.jenis, 'kelas'),
      eq(payments.classId, id),
      eq(payments.status, 'menunggu'),
    ))
    .limit(1)
  if (pendingMine.length)
    throw createError({ statusCode: 409, statusMessage: 'Pengajuan kelas ini masih menunggu konfirmasi.' })

  // Kuota: booking aktif (belum kedaluwarsa) + pengajuan yang menunggu.
  // Booking kedaluwarsa tidak lagi menahan slot.
  const terkonfirmasi = Number(
    (
      await db
        .select({ n: count() })
        .from(bookings)
        .where(and(eq(bookings.classId, id), bookingAktifCond()))
    )[0]?.n ?? 0,
  )
  const menunggu = Number(
    (
      await db
        .select({ n: count() })
        .from(payments)
        .where(and(
          eq(payments.jenis, 'kelas'),
          eq(payments.classId, id),
          eq(payments.status, 'menunggu'),
        ))
    )[0]?.n ?? 0,
  )
  if (terkonfirmasi + menunggu >= kelas.kuota)
    throw createError({ statusCode: 409, statusMessage: 'Kuota kelas sudah penuh.' })

  // Kelas gratis -> langsung terdaftar (atau perpanjang booking lama yang habis).
  if (kelas.harga <= 0) {
    const berlakuSampai = computeBerlakuSampai(kelas.masaBerlakuHari)
    if (existingBooking) {
      // Booking lama sudah kedaluwarsa (yang aktif sudah ditolak di atas) -> perpanjang.
      await db.update(bookings).set({ berlakuSampai }).where(eq(bookings.id, existingBooking.id))
    }
    else {
      try {
        await db.insert(bookings).values({ classId: id, userId: user.id, berlakuSampai })
      }
      catch {
        throw createError({ statusCode: 409, statusMessage: 'Kamu sudah terdaftar di kelas ini.' })
      }
    }
    return { ok: true, gratis: true, berlakuSampai }
  }

  // Kelas berbayar -> buat pengajuan pembayaran.
  const body = await readBody<Record<string, unknown>>(event)
  const buktiTransfer = validateBuktiTransfer(body?.buktiTransfer)
  const catatan = parseCatatan(body?.catatan)

  await db.insert(payments).values({
    userId: user.id,
    jenis: 'kelas',
    classId: id,
    nominal: kelas.harga,
    buktiTransfer,
    catatan,
    status: 'menunggu',
  })

  return { ok: true, gratis: false, nominal: kelas.harga }
})
