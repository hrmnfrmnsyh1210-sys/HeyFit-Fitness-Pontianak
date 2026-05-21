import { and, count, desc, eq, gte, isNull, like, lt, or, type SQL } from 'drizzle-orm'
import { memberships, users } from '../../../database/schema'

/**
 * Daftar member untuk halaman manajemen member.
 * Query: ?q=cari &role=member|admin|owner &status=aktif|kadaluarsa|tanpa &page=1
 */
const PAGE_SIZE = 12

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const query = getQuery(event)
  const q = String(query.q ?? '').trim()
  const role = String(query.role ?? '').trim()
  const status = String(query.status ?? '').trim()
  const page = Math.max(1, Number(query.page) || 1)

  const todayStr = toDateString(today())

  const conds: (SQL | undefined)[] = []
  if (q) conds.push(or(like(users.nama, `%${q}%`), like(users.email, `%${q}%`)))
  if (role === 'member' || role === 'admin' || role === 'owner') conds.push(eq(users.role, role))
  if (status === 'aktif') conds.push(gte(memberships.berakhir, todayStr))
  else if (status === 'kadaluarsa') conds.push(lt(memberships.berakhir, todayStr))
  else if (status === 'tanpa') conds.push(isNull(memberships.id))
  const where = conds.length ? and(...conds) : undefined

  const totalRow = await db
    .select({ n: count() })
    .from(users)
    .leftJoin(memberships, eq(memberships.userId, users.id))
    .where(where)
  const total = Number(totalRow[0]?.n ?? 0)

  const rows = await db
    .select({
      id: users.id,
      nama: users.nama,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      paket: memberships.paket,
      berakhir: memberships.berakhir,
    })
    .from(users)
    .leftJoin(memberships, eq(memberships.userId, users.id))
    .where(where)
    .orderBy(desc(users.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)

  const data = rows.map((r) => {
    const sisaHari = r.berakhir ? daysUntil(r.berakhir) : null
    return {
      id: r.id,
      nama: r.nama,
      email: r.email,
      role: r.role,
      createdAt: r.createdAt,
      membership: r.berakhir
        ? { paket: r.paket, berakhir: r.berakhir, sisaHari, aktif: (sisaHari ?? -1) >= 0 }
        : null,
    }
  })

  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
})
