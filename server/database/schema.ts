import { mysqlTable, int, varchar, mysqlEnum, timestamp, date } from 'drizzle-orm/mysql-core'

/**
 * Tabel users — menyimpan akun untuk semua role:
 * - member : dibuat lewat halaman /register
 * - admin  : dibuat lewat seed script (npm run db:seed)
 * - owner  : dibuat lewat seed script (npm run db:seed)
 */
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  nama: varchar('nama', { length: 120 }).notNull(),
  // 191 = batas aman index utf8mb4 di MySQL/TiDB
  email: varchar('email', { length: 191 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['member', 'admin', 'owner']).notNull().default('member'),
  // Token unik untuk QR code member. Nullable supaya baris lama tetap valid;
  // di-backfill otomatis saat member membuka dashboard.
  qrToken: varchar('qr_token', { length: 64 }).unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Tabel memberships — status keanggotaan tiap user.
 * Satu user punya maksimal satu baris (userId unik):
 * - Aktivasi  -> insert baris baru
 * - Perpanjang -> update tanggal berakhir
 * Relasi ke users dijaga di level aplikasi (userId selalu dari session).
 */
export const memberships = mysqlTable('memberships', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().unique(),
  paket: mysqlEnum('paket', ['bulanan', '3bulan', 'tahunan']).notNull(),
  mulai: date('mulai', { mode: 'string' }).notNull(),
  berakhir: date('berakhir', { mode: 'string' }).notNull(),
  status: mysqlEnum('status', ['aktif', 'kadaluarsa']).notNull().default('aktif'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
})

/**
 * Tabel attendances — log kehadiran member.
 * Satu baris dibuat tiap kali admin men-scan QR member (check-in).
 * Relasi ke users dijaga di level aplikasi.
 */
export const attendances = mysqlTable('attendances', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  // id admin/owner yang melakukan scan (untuk audit).
  scannedBy: int('scanned_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Role = User['role']

export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert
export type Paket = Membership['paket']

export type Attendance = typeof attendances.$inferSelect
export type NewAttendance = typeof attendances.$inferInsert
