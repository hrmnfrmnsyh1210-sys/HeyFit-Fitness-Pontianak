import { count, desc, eq } from 'drizzle-orm'
import { attendances, memberships, users } from '../../../database/schema'

/** Detail satu member: profil + membership + riwayat kehadiran. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = requireIdParam(event)
  const db = useDb()

  const user = (
    await db
      .select({
        id: users.id,
        nama: users.nama,
        email: users.email,
        role: users.role,
        qrToken: users.qrToken,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
  )[0]

  if (!user)
    throw createError({ statusCode: 404, statusMessage: 'Member tidak ditemukan.' })

  const m = (
    await db.select().from(memberships).where(eq(memberships.userId, id)).limit(1)
  )[0]
  const membership = m
    ? {
        paket: m.paket,
        mulai: m.mulai,
        berakhir: m.berakhir,
        sisaHari: daysUntil(m.berakhir),
        aktif: daysUntil(m.berakhir) >= 0,
      }
    : null

  const totalRow = await db
    .select({ n: count() })
    .from(attendances)
    .where(eq(attendances.userId, id))
  const totalKunjungan = Number(totalRow[0]?.n ?? 0)

  const riwayat = await db
    .select({ id: attendances.id, at: attendances.createdAt })
    .from(attendances)
    .where(eq(attendances.userId, id))
    .orderBy(desc(attendances.createdAt))
    .limit(10)

  return { user, membership, totalKunjungan, riwayat }
})
