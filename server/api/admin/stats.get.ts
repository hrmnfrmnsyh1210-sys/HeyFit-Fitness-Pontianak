import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import { attendances, classes, instructors, memberships, users } from '../../database/schema'

/**
 * Ringkasan operasional untuk dashboard admin.
 * Semua angka dihitung langsung dari DB.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()

  const todayDate = today()
  const todayStr = toDateString(todayDate)
  const in7Str = toDateString(addDays(todayDate, 7))
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const num = (rows: { n: number }[]) => Number(rows[0]?.n ?? 0)

  const [totalMembers, activeMemberships, expiringSoon, checkInsToday, newThisMonth] = await Promise.all([
    db.select({ n: count() }).from(users).where(eq(users.role, 'member')).then(num),
    db.select({ n: count() }).from(memberships).where(gte(memberships.berakhir, todayStr)).then(num),
    db.select({ n: count() }).from(memberships)
      .where(and(gte(memberships.berakhir, todayStr), lte(memberships.berakhir, in7Str))).then(num),
    db.select({ n: count() }).from(attendances).where(gte(attendances.createdAt, todayDate)).then(num),
    db.select({ n: count() }).from(users)
      .where(and(eq(users.role, 'member'), gte(users.createdAt, firstOfMonth))).then(num),
  ])

  // Tabel kelas/instruktur mungkin belum dimigrasi — jangan gagalkan dashboard.
  let totalClasses = 0
  let totalInstructors = 0
  try {
    totalClasses = await db.select({ n: count() }).from(classes).where(eq(classes.aktif, true)).then(num)
    totalInstructors = await db.select({ n: count() }).from(instructors).where(eq(instructors.aktif, true)).then(num)
  }
  catch { /* npm run db:migrate-admin belum dijalankan */ }

  // Aktivitas terbaru: gabungan check-in & pendaftaran member baru.
  const recentCheckins = await db
    .select({ nama: users.nama, at: attendances.createdAt })
    .from(attendances)
    .innerJoin(users, eq(attendances.userId, users.id))
    .orderBy(desc(attendances.createdAt))
    .limit(8)

  const recentMembers = await db
    .select({ nama: users.nama, at: users.createdAt })
    .from(users)
    .where(eq(users.role, 'member'))
    .orderBy(desc(users.createdAt))
    .limit(8)

  const activity = [
    ...recentCheckins.map(r => ({ nama: r.nama, aksi: 'Check-in', at: r.at })),
    ...recentMembers.map(r => ({ nama: r.nama, aksi: 'Daftar member', at: r.at })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8)

  return {
    stats: {
      totalMembers,
      activeMemberships,
      expiringSoon,
      checkInsToday,
      newThisMonth,
      totalClasses,
      totalInstructors,
    },
    activity,
  }
})
