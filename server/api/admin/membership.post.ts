import { eq } from 'drizzle-orm'
import { memberships, users } from '../../database/schema'

/**
 * Kelola membership member mana pun (oleh admin).
 * Body:
 *   { userId, paket }            -> aktivasi / perpanjang
 *   { userId, action: 'cancel' } -> batalkan (hapus baris membership)
 *
 * Logika perpanjangan sama dengan /api/member/membership:
 * masih aktif -> dihitung dari tanggal berakhir, selain itu dari hari ini.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ userId?: number, paket?: string, action?: string }>(event)
  const userId = Number(body?.userId)

  if (!Number.isInteger(userId) || userId <= 0)
    throw createError({ statusCode: 400, statusMessage: 'User tidak valid.' })

  const db = useDb()
  const target = (
    await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  )[0]
  if (!target)
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })

  if (body?.action === 'cancel') {
    await db.delete(memberships).where(eq(memberships.userId, userId))
    return { ok: true, membership: null }
  }

  const paket = body?.paket
  if (!isPaket(paket))
    throw createError({ statusCode: 400, statusMessage: 'Paket tidak valid.' })

  const durasi = PAKET_DURASI[paket]
  const hariIni = today()
  const existing = (
    await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1)
  )[0]

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
        mulai: masihAktif ? existing.mulai : toDateString(hariIni),
      })
      .where(eq(memberships.userId, userId))
  }
  else {
    await db.insert(memberships).values({
      userId,
      paket,
      mulai: toDateString(hariIni),
      berakhir: berakhirBaru,
      status: 'aktif',
    })
  }

  return {
    ok: true,
    membership: {
      paket,
      berakhir: berakhirBaru,
      sisaHari: daysUntil(berakhirBaru),
      diperpanjang: Boolean(masihAktif),
    },
  }
})
