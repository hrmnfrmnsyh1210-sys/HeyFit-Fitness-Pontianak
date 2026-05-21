/** Normalisasi catatan opsional — trim & batasi 255 karakter. */
export function parseCatatan(value: unknown): string | null {
  if (value == null) return null
  const v = String(value).trim()
  return v ? v.slice(0, 255) : null
}

/**
 * Validasi bukti transfer berupa data URL gambar base64.
 * Mengembalikan string yang sudah dipastikan valid, atau melempar 400/413.
 */
export function validateBuktiTransfer(value: unknown): string {
  const v = typeof value === 'string' ? value.trim() : ''
  if (!v)
    throw createError({ statusCode: 400, statusMessage: 'Bukti transfer wajib diunggah.' })
  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(v))
    throw createError({ statusCode: 400, statusMessage: 'Bukti transfer harus berupa gambar (PNG/JPG/WEBP).' })
  // Bukti hasil kompresi di klien seharusnya jauh di bawah batas ini.
  if (v.length > 3_500_000)
    throw createError({ statusCode: 413, statusMessage: 'Ukuran gambar terlalu besar. Maksimal sekitar 2,5 MB.' })
  return v
}
