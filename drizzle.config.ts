import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'mysql',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    host: process.env.TIDB_HOST!,
    port: Number(process.env.TIDB_PORT ?? 4000),
    user: process.env.TIDB_USER!,
    password: process.env.TIDB_PASSWORD!,
    database: process.env.TIDB_DATABASE!,
    // MySQL lokal: set TIDB_SSL=false di .env untuk koneksi tanpa TLS.
    // minVersion valid untuk mysql2 tapi belum ada di tipe SslOptions drizzle-kit.
    ssl: process.env.TIDB_SSL === 'false'
      ? undefined
      : { minVersion: 'TLSv1.2', rejectUnauthorized: true } as { rejectUnauthorized: boolean },
  },
})
