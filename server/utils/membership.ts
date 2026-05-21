/** Konfigurasi paket membership — durasi dalam hari. */
export const PAKET_DURASI = {
  bulanan: 30,
  '3bulan': 90,
  tahunan: 365,
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
