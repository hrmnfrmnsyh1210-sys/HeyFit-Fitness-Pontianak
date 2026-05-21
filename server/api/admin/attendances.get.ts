import { alias } from 'drizzle-orm/mysql-core'
import { and, count, desc, eq, gte, like, lt, or, type SQL } from 'drizzle-orm'
import { attendances, users } from '../../database/schema'

/**
 * Riwayat check-in semua member.
 * Query: ?q=cari &date=YYYY-MM-DD &page=1
 */
const PAGE_SIZE = 15

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const query = getQuery(event)
  const q = String(query.q ?? '').trim()
  const dateStr = String(query.date ?? '').trim()
  const page = Math.max(1, Number(query.page) || 1)

  // Alias kedua atas tabel users untuk nama admin yang men-scan.
  const scanner = alias(users, 'scanner')

  const conds: (SQL | undefined)[] = []
  if (q) conds.push(or(like(users.nama, `%${q}%`), like(users.email, `%${q}%`)))
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const start = new Date(`${dateStr}T00:00:00`)
    const end = new Date(start.getTime() + 86_400_000)
    conds.push(and(gte(attendances.createdAt, start), lt(attendances.createdAt, end)))
  }
  const where = conds.length ? and(...conds) : undefined

  const totalRow = await db
    .select({ n: count() })
    .from(attendances)
    .innerJoin(users, eq(attendances.userId, users.id))
    .where(where)
  const total = Number(totalRow[0]?.n ?? 0)

  const data = await db
    .select({
      id: attendances.id,
      at: attendances.createdAt,
      memberId: users.id,
      memberNama: users.nama,
      memberEmail: users.email,
      scannedBy: scanner.nama,
    })
    .from(attendances)
    .innerJoin(users, eq(attendances.userId, users.id))
    .leftJoin(scanner, eq(attendances.scannedBy, scanner.id))
    .where(where)
    .orderBy(desc(attendances.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)

  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
})
