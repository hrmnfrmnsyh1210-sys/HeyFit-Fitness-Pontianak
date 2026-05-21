import type { H3Event } from 'h3'

/**
 * Pastikan request datang dari user dengan role admin atau owner.
 * Dipakai di semua endpoint /api/admin/*.
 *
 * - Belum login            -> 401 (dari requireUserSession)
 * - Login tapi role member -> 403
 *
 * Mengembalikan data user session supaya handler bisa mencatat siapa
 * yang melakukan aksi (mis. attendances.scannedBy).
 */
export async function requireAdmin(event: H3Event) {
  const { user } = await requireUserSession(event)

  if (user.role !== 'admin' && user.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Akses khusus admin.' })
  }

  return user
}

/** Parse parameter route `id` menjadi integer positif, atau lempar 400. */
export function requireIdParam(event: H3Event): number {
  const raw = getRouterParam(event, 'id')
  const id = Number(raw)

  if (!raw || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID tidak valid.' })
  }

  return id
}
