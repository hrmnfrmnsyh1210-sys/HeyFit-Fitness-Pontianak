import { eq } from 'drizzle-orm'
import { memberships } from '../database/schema'

/** Konfigurasi paket membership — durasi dalam hari. */
export const PAKET_DURASI = {
  bulanan: 30,
  '3bulan': 90,
  tahunan: 365,
} as const

/** Harga tiap paket membership dalam rupiah. */
export const PAKET_HARGA = {
  bulanan: 250_000,
  '3bulan': 700_000,
  tahunan: 2_400_000,
} as const

export type PaketId = keyof typeof PAKET_DURASI

export const PAKET_VALID = Object.keys(PAKET_DURASI) as PaketId[]

export function isPaket(value: unknown): value is PaketId {
  return typeof value === 'string' && (PAKET_VALID as string[]).includes(value)
}

/** Format Date ke string 'YYYY-MM-DD' (untuk kolom DATE). */
export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Date hari ini (tanpa jam). */
export function today(): Date {
  return new Date(toDateString(new Date()))
}

/** Tambah sejumlah hari ke sebuah tanggal, menghasilkan Date baru. */
export function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

/** Selisih hari dari hari ini ke tanggal target (negatif jika sudah lewat). */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  const now = today().getTime()
  return Math.round((target - now) / 86_400_000)
}

/**
 * Aktifkan / perpanjang membership seorang user.
 * - Belum punya / sudah kadaluarsa -> dihitung dari hari ini
 * - Masih aktif                    -> diperpanjang dari tanggal berakhir
 * Dipakai oleh endpoint persetujuan pembayaran admin.
 */
export async function applyMembership(userId: number, paket: PaketId) {
  const db = useDb()
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
    paket,
    berakhir: berakhirBaru,
    sisaHari: daysUntil(berakhirBaru),
    diperpanjang: Boolean(masihAktif),
  }
}
