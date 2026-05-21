import { eq } from 'drizzle-orm'
import { memberships, users } from '../../database/schema'

/**
 * Ringkasan akun member: profil (dari session) + status membership (dari DB)
 * + QR code member untuk check-in di gym.
 * Wajib login.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const db = useDb()

  // Ambil qrToken dari DB. Member lama (sebelum fitur QR) belum punya token —
  // dibuatkan sekarang lalu disimpan (backfill malas).
  const userRow = (
    await db.select({ qrToken: users.qrToken }).from(users).where(eq(users.id, user.id)).limit(1)
  )[0]

  let qrToken = userRow?.qrToken ?? null
  if (!qrToken) {
    qrToken = generateQrToken()
    await db.update(users).set({ qrToken }).where(eq(users.id, user.id))
  }

  const qrImage = await qrTokenToDataUrl(qrToken)

  const rows = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .limit(1)

  const row = rows[0]

  if (!row) {
    return { user, membership: null, qr: { token: qrToken, image: qrImage } }
  }

  const sisaHari = daysUntil(row.berakhir)
  const aktif = sisaHari >= 0

  return {
    user,
    membership: {
      paket: row.paket,
      mulai: row.mulai,
      berakhir: row.berakhir,
      status: aktif ? 'aktif' : 'kadaluarsa',
      aktif,
      sisaHari,
    },
    qr: { token: qrToken, image: qrImage },
  }
})
