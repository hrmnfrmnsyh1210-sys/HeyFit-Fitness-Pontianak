import { and, count, desc, eq, gte } from 'drizzle-orm'
import { attendances, memberships, users } from '../../database/schema'

/**
 * Scan QR member oleh admin/owner → catat kehadiran (check-in).
 * Body: { token: string }  — isi QR code member.
 *
 * - Token tidak dikenali           -> 404
 * - Sudah check-in < 5 menit lalu  -> tidak dicatat ganda (duplikat: true)
 * - Selain itu                     -> insert baris attendance baru
 *
 * Mengembalikan profil member + status membership supaya admin tahu
 * apakah member boleh masuk.
 */
const DEDUP_MS = 5 * 60_000

export default defineEventHandler(async (event) => {
  const { user: admin } = await requireUserSession(event)

  if (admin.role !== 'admin' && admin.role !== 'owner')
    throw createError({ statusCode: 403, statusMessage: 'Hanya admin yang bisa men-scan QR.' })

  const body = await readBody<{ token?: string }>(event)
  const token = body?.token?.trim() ?? ''

  if (!token)
    throw createError({ statusCode: 400, statusMessage: 'Kode QR kosong.' })

  const db = useDb()

  const member = (
    await db
      .select({ id: users.id, nama: users.nama, email: users.email, role: users.role })
      .from(users)
      .where(eq(users.qrToken, token))
      .limit(1)
  )[0]

  if (!member)
    throw createError({ statusCode: 404, statusMessage: 'QR tidak dikenali. Pastikan kode benar.' })

  // Status membership — penting supaya admin tahu member masih aktif atau tidak.
  const m = (
    await db.select().from(memberships).where(eq(memberships.userId, member.id)).limit(1)
  )[0]
  const membership = m
    ? {
        paket: m.paket,
        berakhir: m.berakhir,
        sisaHari: daysUntil(m.berakhir),
        aktif: daysUntil(m.berakhir) >= 0,
      }
    : null

  // Cegah check-in ganda dari scan beruntun.
  const recent = (
    await db
      .select({ createdAt: attendances.createdAt })
      .from(attendances)
      .where(and(
        eq(attendances.userId, member.id),
        gte(attendances.createdAt, new Date(Date.now() - DEDUP_MS)),
      ))
      .orderBy(desc(attendances.createdAt))
      .limit(1)
  )[0]

  let duplikat = false
  let checkInAt: Date

  if (recent) {
    duplikat = true
    checkInAt = recent.createdAt
  }
  else {
    checkInAt = new Date()
    await db.insert(attendances).values({ userId: member.id, scannedBy: admin.id })
  }

  const totalRow = (
    await db.select({ n: count() }).from(attendances).where(eq(attendances.userId, member.id))
  )[0]

  return {
    member,
    membership,
    checkIn: { at: checkInAt, duplikat },
    totalKunjungan: Number(totalRow?.n ?? 0),
  }
})
