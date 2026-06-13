// Generator file .drawio (mxGraph XML) untuk ERD Heyfit Fitness.
// Jalankan: node scripts/generate-erd-drawio.mjs
// Output  : docs/heyfit-erd.drawio  (import via draw.io: File > Open / Import)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../docs/heyfit-erd.drawio')

// Definisi entitas: [ {key,flags}, ... ]  flags: P=PK, U=UK, F=FK
const tables = {
  users: {
    x: 40, y: 40,
    rows: [
      ['id', 'PK', 'int'],
      ['nama', '', 'varchar(120)'],
      ['email', 'UK', 'varchar(191)'],
      ['password_hash', '', 'varchar(255)'],
      ['role', '', 'enum member|admin|owner'],
      ['qr_token', 'UK', 'varchar(64)'],
      ['created_at', '', 'timestamp'],
    ],
  },
  memberships: {
    x: 40, y: 360,
    rows: [
      ['id', 'PK', 'int'],
      ['user_id', 'FK·UK', 'int → users.id'],
      ['paket', '', 'enum bulanan|3bulan|tahunan'],
      ['mulai', '', 'date'],
      ['berakhir', '', 'date'],
      ['status', '', 'enum aktif|kadaluarsa'],
      ['created_at', '', 'timestamp'],
      ['updated_at', '', 'timestamp'],
    ],
  },
  attendances: {
    x: 40, y: 720,
    rows: [
      ['id', 'PK', 'int'],
      ['user_id', 'FK', 'int → users.id'],
      ['scanned_by', 'FK', 'int → users.id (admin)'],
      ['created_at', '', 'timestamp'],
    ],
  },
  instructors: {
    x: 760, y: 40,
    rows: [
      ['id', 'PK', 'int'],
      ['nama', '', 'varchar(120)'],
      ['spesialisasi', '', 'varchar(120)'],
      ['bio', '', 'varchar(400)'],
      ['aktif', '', 'boolean'],
      ['created_at', '', 'timestamp'],
    ],
  },
  classes: {
    x: 760, y: 320,
    rows: [
      ['id', 'PK', 'int'],
      ['nama', '', 'varchar(120)'],
      ['kategori', '', 'enum Mind&Body|Cardio|Strength|Dance'],
      ['instructor_id', 'FK', 'int → instructors.id (null)'],
      ['jadwal', '', 'varchar(120)'],
      ['durasi_menit', '', 'int'],
      ['kuota', '', 'int'],
      ['intensitas', '', 'int (1-3)'],
      ['harga', '', 'int'],
      ['masa_berlaku_hari', '', 'int'],
      ['aktif', '', 'boolean'],
      ['created_at', '', 'timestamp'],
    ],
  },
  bookings: {
    x: 420, y: 760,
    rows: [
      ['id', 'PK', 'int'],
      ['class_id', 'FK', 'int → classes.id'],
      ['user_id', 'FK', 'int → users.id'],
      ['berlaku_sampai', '', 'date (null)'],
      ['created_at', '', 'timestamp'],
    ],
  },
  payments: {
    x: 1180, y: 320,
    rows: [
      ['id', 'PK', 'int'],
      ['user_id', 'FK', 'int → users.id'],
      ['jenis', '', 'enum membership|kelas'],
      ['paket', '', 'enum bulanan|3bulan|tahunan (null)'],
      ['class_id', 'FK', 'int → classes.id (null)'],
      ['nominal', '', 'int'],
      ['metode', '', 'enum transfer'],
      ['bukti_transfer', '', 'text'],
      ['catatan', '', 'varchar(255)'],
      ['status', '', 'enum menunggu|disetujui|ditolak'],
      ['catatan_admin', '', 'varchar(255)'],
      ['reviewed_by', 'FK', 'int → users.id (admin)'],
      ['reviewed_at', '', 'timestamp'],
      ['created_at', '', 'timestamp'],
    ],
  },
  galleries: {
    x: 1180, y: 40,
    rows: [
      ['id', 'PK', 'int'],
      ['judul', '', 'varchar(160)'],
      ['kategori', '', 'varchar(60)'],
      ['ringkasan', '', 'varchar(300)'],
      ['konten', '', 'text'],
      ['gambar', '', 'text'],
      ['tampil', '', 'boolean'],
      ['created_at', '', 'timestamp'],
      ['updated_at', '', 'timestamp'],
    ],
  },
}

// Relasi: [tabelInduk, kolomInduk, tabelAnak, kolomAnak, label, kardinalitasAnak]
// kardinalitasAnak: 'many' (crow's foot) atau 'one' (1:1)
const rels = [
  ['users', 'id', 'memberships', 'user_id', 'punya 1:1', 'one'],
  ['users', 'id', 'attendances', 'user_id', 'hadir', 'many'],
  ['users', 'id', 'attendances', 'scanned_by', 'men-scan', 'many'],
  ['users', 'id', 'bookings', 'user_id', 'memesan', 'many'],
  ['users', 'id', 'payments', 'user_id', 'mengajukan', 'many'],
  ['users', 'id', 'payments', 'reviewed_by', 'meninjau', 'many'],
  ['instructors', 'id', 'classes', 'instructor_id', 'mengajar', 'many'],
  ['classes', 'id', 'bookings', 'class_id', 'dipesan', 'many'],
  ['classes', 'id', 'payments', 'class_id', 'dibayar', 'many'],
]

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const W = 280
const RH = 26
const HEAD = 28

const cells = []
const rowCellId = {} // `${table}.${col}` -> id baris (untuk titik koneksi)

for (const [name, def] of Object.entries(tables)) {
  const h = HEAD + def.rows.length * RH
  const tid = `t_${name}`
  cells.push(
    `<mxCell id="${tid}" value="${esc(name)}" style="shape=table;startSize=${HEAD};container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=1;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="${def.x}" y="${def.y}" width="${W}" height="${h}" as="geometry"/></mxCell>`,
  )
  def.rows.forEach(([col, flag, type], i) => {
    const rid = `${tid}_r${i}`
    rowCellId[`${name}.${col}`] = rid
    cells.push(
      `<mxCell id="${rid}" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom=0;" vertex="1" parent="${tid}"><mxGeometry y="${HEAD + i * RH}" width="${W}" height="${RH}" as="geometry"/></mxCell>`,
    )
    cells.push(
      `<mxCell id="${rid}_k" value="${esc(flag)}" style="shape=partialRectangle;overflow=hidden;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=4;align=center;" vertex="1" parent="${rid}"><mxGeometry width="56" height="${RH}" as="geometry"><mxRectangle width="56" height="${RH}" as="alternateBounds"/></mxGeometry></mxCell>`,
    )
    const bold = flag.includes('PK') ? 'fontStyle=5;' : ''
    cells.push(
      `<mxCell id="${rid}_c" value="${esc(col)}&#160;&#160;&#160;&lt;font color=&apos;#888&apos;&gt;${esc(type)}&lt;/font&gt;" style="shape=partialRectangle;overflow=hidden;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;spacingLeft=6;${bold}" vertex="1" parent="${rid}"><mxGeometry x="56" width="${W - 56}" height="${RH}" as="geometry"><mxRectangle width="${W - 56}" height="${RH}" as="alternateBounds"/></mxGeometry></mxCell>`,
    )
  })
}

let e = 0
for (const [pt, pc, ct, cc, label, card] of rels) {
  const src = rowCellId[`${pt}.${pc}`]
  const dst = rowCellId[`${ct}.${cc}`]
  // startArrow ERone (|), endArrow: ERmany (crow's foot) atau ERone
  const endArrow = card === 'many' ? 'ERmany' : 'ERone'
  const style = `edgeStyle=entityRelationEdgeStyle;fontSize=11;html=1;endArrow=${endArrow};startArrow=ERone;rounded=0;exitX=1;exitY=0.5;entryX=0;entryY=0.5;`
  cells.push(
    `<mxCell id="e_${e}" value="${esc(label)}" style="${style}" edge="1" parent="1" source="${src}" target="${dst}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  )
  e++
}

const xml = `<mxfile host="app.diagrams.net" type="device">
  <diagram id="heyfit-erd" name="Heyfit ERD">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1800" pageHeight="1200" math="0" shadow="0">
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
console.log(`OK -> ${out}  (${Object.keys(tables).length} tabel, ${rels.length} relasi)`)
