/** Format angka ke rupiah, mis. 250000 -> "Rp 250.000". */
export function rupiah(n: number | null | undefined): string {
  return `Rp ${Number(n ?? 0).toLocaleString('id-ID')}`
}

/** Format tanggal ISO/string ke format Indonesia, mis. "21 Mei 2026". */
export function tanggalID(value: string | Date | null | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
