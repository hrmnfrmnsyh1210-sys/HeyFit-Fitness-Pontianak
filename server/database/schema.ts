import { mysqlTable, int, varchar, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core'

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
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Role = User['role']
