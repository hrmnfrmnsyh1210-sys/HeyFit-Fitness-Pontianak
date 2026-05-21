import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, date, boolean, unique } from 'drizzle-orm/mysql-core'

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

/**
 * Tabel instructors — data pelatih/instruktur kelas.
 * Dikelola lewat dashboard admin (/admin/instruktur).
 */
export const instructors = mysqlTable('instructors', {
  id: int('id').autoincrement().primaryKey(),
  nama: varchar('nama', { length: 120 }).notNull(),
  spesialisasi: varchar('spesialisasi', { length: 120 }).notNull(),
  bio: varchar('bio', { length: 400 }),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Tabel classes — jadwal kelas yang ditawarkan gym.
 * Dikelola lewat dashboard admin (/admin/kelas).
 * instructorId nullable — relasi ke instructors dijaga di level aplikasi.
 */
export const classes = mysqlTable('classes', {
  id: int('id').autoincrement().primaryKey(),
  nama: varchar('nama', { length: 120 }).notNull(),
  kategori: mysqlEnum('kategori', ['Mind & Body', 'Cardio', 'Strength', 'Dance']).notNull(),
  instructorId: int('instructor_id'),
  // Jadwal disimpan sebagai teks bebas, mis. "Sen & Rab · 18:00".
  jadwal: varchar('jadwal', { length: 120 }).notNull(),
  durasiMenit: int('durasi_menit').notNull().default(60),
  kuota: int('kuota').notNull().default(15),
  // Skala intensitas 1–3 (ringan → berat).
  intensitas: int('intensitas').notNull().default(2),
  // Harga sekali booking dalam rupiah. 0 = gratis.
  harga: int('harga').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Tabel bookings — reservasi member untuk sebuah kelas.
 * Satu baris = satu member terdaftar pada satu kelas (slot terpakai).
 * - Booking  -> insert baris
 * - Batal    -> hapus baris
 * Unique (class_id, user_id): satu member maksimal satu reservasi per kelas.
 * Relasi ke classes & users dijaga di level aplikasi.
 */
export const bookings = mysqlTable('bookings', {
  id: int('id').autoincrement().primaryKey(),
  classId: int('class_id').notNull(),
  userId: int('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [
  unique('bookings_class_user_unique').on(t.classId, t.userId),
])

export type Instructor = typeof instructors.$inferSelect
export type NewInstructor = typeof instructors.$inferInsert

export type GymClass = typeof classes.$inferSelect
export type NewGymClass = typeof classes.$inferInsert
export type KategoriKelas = GymClass['kategori']

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

/**
 * Tabel payments — pengajuan pembayaran yang menunggu konfirmasi admin.
 * Satu baris dibuat tiap kali member mengirim bukti transfer untuk:
 * - jenis 'membership' : aktivasi/perpanjang membership (kolom `paket` diisi)
 * - jenis 'kelas'      : booking sebuah kelas (kolom `classId` diisi)
 * Admin meninjau lalu menyetujui/menolak. Saat disetujui, efek sampingnya
 * dijalankan (membership diaktifkan / baris booking dibuat).
 */
export const payments = mysqlTable('payments', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  jenis: mysqlEnum('jenis', ['membership', 'kelas']).notNull(),
  // Diisi sesuai jenis:
  paket: mysqlEnum('paket', ['bulanan', '3bulan', 'tahunan']),
  classId: int('class_id'),
  nominal: int('nominal').notNull(),
  metode: mysqlEnum('metode', ['transfer']).notNull().default('transfer'),
  // Bukti transfer disimpan sebagai data URL base64 (kolom LONGTEXT di DB).
  buktiTransfer: text('bukti_transfer').notNull(),
  catatan: varchar('catatan', { length: 255 }),
  status: mysqlEnum('status', ['menunggu', 'disetujui', 'ditolak']).notNull().default('menunggu'),
  // Alasan/keterangan dari admin saat meninjau.
  catatanAdmin: varchar('catatan_admin', { length: 255 }),
  reviewedBy: int('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
