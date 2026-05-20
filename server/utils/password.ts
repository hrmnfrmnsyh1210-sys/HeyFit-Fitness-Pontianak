import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LEN = 64

/**
 * Hash password dengan scrypt. Format hasil: "<salt-hex>:<derivedKey-hex>".
 * Tidak butuh dependency eksternal — pakai node:crypto bawaan.
 * Diberi nama "User" agar tidak bentrok dengan helper bawaan nuxt-auth-utils.
 */
export async function hashUserPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

/** Verifikasi password terhadap hash tersimpan, aman dari timing attack. */
export async function verifyUserPassword(stored: string, password: string): Promise<boolean> {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false

  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  const keyBuffer = Buffer.from(key, 'hex')

  if (keyBuffer.length !== derived.length) return false
  return timingSafeEqual(keyBuffer, derived)
}
