import { eq } from 'drizzle-orm'
import { memberships } from '../../database/schema'

/**
 * Ringkasan akun member: profil (dari session) + status membership (dari DB).
 * Wajib login.
 */
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const db = useDb()
  const rows = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, user.id))
    .limit(1)

  const row = rows[0]

  if (!row) {
    return { user, membership: null }
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
  }
})
