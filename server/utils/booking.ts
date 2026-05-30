import { gte, isNull, or, type SQL } from 'drizzle-orm'
import { bookings } from '../database/schema'
import { addDays, daysUntil, today, toDateString } from './membership'

/**
 * Hitung tanggal berakhir booking dari masa berlaku kelas (dalam hari).
 * - masaBerlakuHari <= 0  -> null (booking tanpa batas / berlaku selamanya)
 * - selain itu            -> 'YYYY-MM-DD' = hari ini + masaBerlakuHari
 */
export function computeBerlakuSampai(masaBerlakuHari: number): string | null {
  if (!Number.isFinite(masaBerlakuHari) || masaBerlakuHari <= 0) return null
  return toDateString(addDays(today(), masaBerlakuHari))
}

/**
 * Kondisi SQL: booking masih aktif — tanpa batas (berlaku_sampai NULL) atau
 * tanggal berakhirnya belum lewat (>= hari ini).
 * Dipakai untuk hitung kuota terisi & cek "sudah terdaftar".
 */
export function bookingAktifCond(): SQL {
  return or(isNull(bookings.berlakuSampai), gte(bookings.berlakuSampai, toDateString(today())))!
}

/** Apakah sebuah nilai berlaku_sampai masih aktif (belum kedaluwarsa). */
export function bookingMasihAktif(berlakuSampai: string | null): boolean {
  return berlakuSampai == null || daysUntil(berlakuSampai) >= 0
}
