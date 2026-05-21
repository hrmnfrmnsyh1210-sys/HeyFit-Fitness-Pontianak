import { randomBytes } from 'node:crypto'
import QRCode from 'qrcode'

/**
 * Token unik untuk QR code member — 32 karakter hex, tidak bisa ditebak.
 * Dipakai sebagai isi QR; admin men-scan-nya untuk identifikasi member.
 */
export function generateQrToken(): string {
  return randomBytes(16).toString('hex')
}

/** Render token menjadi gambar QR berbentuk data URL PNG (siap dipakai di <img>). */
export function qrTokenToDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: { dark: '#05060a', light: '#ffffff' },
  })
}
