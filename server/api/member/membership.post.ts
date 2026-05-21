import { eq } from 'drizzle-orm'
import { memberships } from '../../database/schema'

/**
 * Aktivasi atau perpanjang membership untuk user yang sedang login.
 * Body: { paket: 'bulanan' | '3bulan' | 'tahunan' }
 *
 * - Belum punya membership / sudah kadaluarsa  -> mulai dihitung dari hari ini
 * - Membership masih aktif                     -> diperpanjang dari tanggal berakhir
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody<{ paket?: string }>(event)
  const paket = body?.paket

  if (!isPaket(paket)) {
    throw createError({ statusCode: 400, statusMessage: 'Paket tidak valid.' })
  }

  const db = useDb()
  const durasi = PAKET_DURASI[paket]
  const hariIni = today()

  const existing = (
    await db.select().from(memberships).where(eq(memberships.userId, user.id)).limit(1)
  )[0]

  // Titik mulai perhitungan: dari tanggal berakhir kalau masih aktif,
  // selain itu dari hari ini.
  const masihAktif = existing && daysUntil(existing.berakhir) >= 0
  const basis = masihAktif ? new Date(existing.berakhir) : hariIni
  const berakhirBaru = toDateString(addDays(basis, durasi))

  if (existing) {
    await db
      .update(memberships)
      .set({
        paket,
        berakhir: berakhirBaru,
        status: 'aktif',
        // Kalau sudah kadaluarsa, tanggal mulai di-reset ke hari ini.
        mulai: masihAktif ? existing.mulai : toDateString(hariIni),
      })
      .where(eq(memberships.userId, user.id))
  }
  else {
    await db.insert(memberships).values({
      userId: user.id,
      paket,
      mulai: toDateString(hariIni),
      berakhir: berakhirBaru,
      status: 'aktif',
    })
  }

  return {
    membership: {
      paket,
      berakhir: berakhirBaru,
      sisaHari: daysUntil(berakhirBaru),
      diperpanjang: Boolean(masihAktif),
    },
  }
})
