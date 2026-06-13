// Generator file .drawio gaya KLASIK (notasi Chen) untuk ERD Heyfit Fitness.
//   persegi  = entitas
//   oval     = atribut (PK digarisbawahi)
//   ketupat  = relasi  (dengan label kardinalitas 1 / N)
// Jalankan: node scripts/generate-erd-chen-drawio.mjs
// Output  : docs/heyfit-erd-chen.drawio  (import via draw.io: File > Open)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../docs/heyfit-erd-chen.drawio')

// fill gelap seperti contoh, teks putih
const FILL = '#33475b'
const STROKE = '#23323f'
const FONT = '#ffffff'

// Entitas: nama -> { cx, cy, attrs: [namaKolom, ...] }  ('id' otomatis jadi PK (underline)
const entities = {
  users:       { cx: 1000, cy: 800,  attrs: ['id', 'nama', 'email', 'password_hash', 'role', 'qr_token', 'created_at'] },
  memberships: { cx: 1000, cy: 2100, attrs: ['id', 'user_id', 'paket', 'mulai', 'berakhir', 'status', 'created_at', 'updated_at'] },
  attendances: { cx: 250,  cy: 1450, attrs: ['id', 'user_id', 'scanned_by', 'created_at'] },
  bookings:    { cx: 1950, cy: 2100, attrs: ['id', 'class_id', 'user_id', 'berlaku_sampai', 'created_at'] },
  classes:     { cx: 2900, cy: 1400, attrs: ['id', 'nama', 'kategori', 'instructor_id', 'jadwal', 'durasi_menit', 'kuota', 'intensitas', 'harga', 'masa_berlaku_hari', 'aktif', 'created_at'] },
  instructors: { cx: 2900, cy: 2700, attrs: ['id', 'nama', 'spesialisasi', 'bio', 'aktif', 'created_at'] },
  payments:    { cx: 4100, cy: 700,  attrs: ['id', 'user_id', 'jenis', 'paket', 'class_id', 'nominal', 'metode', 'bukti_transfer', 'catatan', 'status', 'catatan_admin', 'reviewed_by', 'reviewed_at', 'created_at'] },
  galleries:   { cx: 4100, cy: 2500, attrs: ['id', 'judul', 'kategori', 'ringkasan', 'konten', 'gambar', 'tampil', 'created_at', 'updated_at'] },
}

// Relasi: [entitas1, kard1, label, entitas2, kard2]
const rels = [
  ['users', '1', 'Punya', 'memberships', '1'],
  ['users', '1', 'Hadir', 'attendances', 'N'],
  ['users', '1', 'Memesan', 'bookings', 'N'],
  ['users', '1', 'Mengajukan', 'payments', 'N'],
  ['instructors', '1', 'Mengajar', 'classes', 'N'],
  ['classes', '1', 'Dipesan', 'bookings', 'N'],
  ['classes', '1', 'Dibayar', 'payments', 'N'],
]

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cells = []
const entId = {} // nama -> id sel entitas

const EW = 170, EH = 70    // entitas
const OW = 150, OH = 46    // oval atribut
const DW = 150, DH = 90    // ketupat relasi

// --- Entitas + atribut ---
for (const [name, def] of Object.entries(entities)) {
  const eid = `ent_${name}`
  entId[name] = eid
  cells.push(
    `<mxCell id="${eid}" value="${esc(name)}" style="rounded=0;whiteSpace=wrap;html=1;fillColor=${FILL};strokeColor=${STROKE};fontColor=${FONT};fontStyle=1;fontSize=14;" vertex="1" parent="1"><mxGeometry x="${def.cx - EW / 2}" y="${def.cy - EH / 2}" width="${EW}" height="${EH}" as="geometry"/></mxCell>`,
  )
  const n = def.attrs.length
  const R = Math.max(190, 26 * n)
  def.attrs.forEach((col, i) => {
    const theta = (-90 + (360 / n) * i) * Math.PI / 180
    const ox = def.cx + R * Math.cos(theta) - OW / 2
    const oy = def.cy + R * Math.sin(theta) - OH / 2
    const pk = col === 'id'
    const oid = `${eid}_a${i}`
    cells.push(
      `<mxCell id="${oid}" value="${esc(col)}" style="ellipse;whiteSpace=wrap;html=1;fillColor=${FILL};strokeColor=${STROKE};fontColor=${FONT};fontSize=12;${pk ? 'fontStyle=4;' : ''}" vertex="1" parent="1"><mxGeometry x="${Math.round(ox)}" y="${Math.round(oy)}" width="${OW}" height="${OH}" as="geometry"/></mxCell>`,
    )
    cells.push(
      `<mxCell id="${oid}_l" style="endArrow=none;html=1;strokeColor=${STROKE};" edge="1" parent="1" source="${oid}" target="${eid}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    )
  })
}

// --- Relasi (ketupat) ---
let r = 0
for (const [e1, k1, label, e2, k2] of rels) {
  const a = entities[e1], b = entities[e2]
  const dx = (a.cx + b.cx) / 2 - DW / 2
  const dy = (a.cy + b.cy) / 2 - DH / 2
  const did = `rel_${r}`
  cells.push(
    `<mxCell id="${did}" value="${esc(label)}" style="rhombus;whiteSpace=wrap;html=1;fillColor=${FILL};strokeColor=${STROKE};fontColor=${FONT};fontStyle=1;fontSize=13;" vertex="1" parent="1"><mxGeometry x="${Math.round(dx)}" y="${Math.round(dy)}" width="${DW}" height="${DH}" as="geometry"/></mxCell>`,
  )
  cells.push(
    `<mxCell id="${did}_e1" value="${esc(k1)}" style="endArrow=none;html=1;strokeColor=${STROKE};fontColor=#000000;fontSize=13;fontStyle=1;" edge="1" parent="1" source="${entId[e1]}" target="${did}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  )
  cells.push(
    `<mxCell id="${did}_e2" value="${esc(k2)}" style="endArrow=none;html=1;strokeColor=${STROKE};fontColor=#000000;fontSize=13;fontStyle=1;" edge="1" parent="1" source="${did}" target="${entId[e2]}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  )
  r++
}

const xml = `<mxfile host="app.diagrams.net" type="device">
  <diagram id="heyfit-erd-chen" name="Heyfit ERD (Chen)">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2339" pageHeight="1654" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, xml, 'utf8')
console.log(`OK -> ${out}  (${Object.keys(entities).length} entitas, ${rels.length} relasi)`)
