// Generator file .drawio (mxGraph XML) untuk LRS (Logical Record Structure) Heyfit Fitness.
//   Tiap record type = kotak berisi daftar field.
//   PK  : digarisbawahi    FK : ditandai (FK)
//   Relasi antar record digambar garis lurus berlabel kardinalitas 1 / M.
// Jalankan: node scripts/generate-lrs-drawio.mjs
// Output  : docs/heyfit-lrs.drawio  (buka via draw.io: File > Open)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../docs/heyfit-lrs.drawio')

// Definisi record: nama -> { x, y, fields: [ [kolom, key] ] }  key: 'PK' | 'FK' | ''
const tables = {
  users: {
    x: 40, y: 40,
    fields: [
      ['id', 'PK'],
      ['nama', ''],
      ['email', ''],
      ['password_hash', ''],
      ['role', ''],
      ['qr_token', ''],
      ['created_at', ''],
    ],
  },
  memberships: {
    x: 40, y: 360,
    fields: [
      ['id', 'PK'],
      ['user_id', 'FK'],
      ['paket', ''],
      ['mulai', ''],
      ['berakhir', ''],
      ['status', ''],
      ['created_at', ''],
      ['updated_at', ''],
    ],
  },
  attendances: {
    x: 40, y: 720,
    fields: [
      ['id', 'PK'],
      ['user_id', 'FK'],
      ['scanned_by', 'FK'],
      ['created_at', ''],
    ],
  },
  instructors: {
    x: 760, y: 40,
    fields: [
      ['id', 'PK'],
      ['nama', ''],
      ['spesialisasi', ''],
      ['bio', ''],
      ['aktif', ''],
      ['created_at', ''],
    ],
  },
  classes: {
    x: 760, y: 320,
    fields: [
      ['id', 'PK'],
      ['nama', ''],
      ['kategori', ''],
      ['instructor_id', 'FK'],
      ['jadwal', ''],
      ['durasi_menit', ''],
      ['kuota', ''],
      ['intensitas', ''],
      ['harga', ''],
      ['masa_berlaku_hari', ''],
      ['aktif', ''],
      ['created_at', ''],
    ],
  },
  bookings: {
    x: 420, y: 760,
    fields: [
      ['id', 'PK'],
      ['class_id', 'FK'],
      ['user_id', 'FK'],
      ['berlaku_sampai', ''],
      ['created_at', ''],
    ],
  },
  payments: {
    x: 1180, y: 320,
    fields: [
      ['id', 'PK'],
      ['user_id', 'FK'],
      ['jenis', ''],
      ['paket', ''],
      ['class_id', 'FK'],
      ['nominal', ''],
      ['metode', ''],
      ['bukti_transfer', ''],
      ['catatan', ''],
      ['status', ''],
      ['catatan_admin', ''],
      ['reviewed_by', 'FK'],
      ['reviewed_at', ''],
      ['created_at', ''],
    ],
  },
  galleries: {
    x: 1180, y: 40,
    fields: [
      ['id', 'PK'],
      ['judul', ''],
      ['kategori', ''],
      ['ringkasan', ''],
      ['konten', ''],
      ['gambar', ''],
      ['tampil', ''],
      ['created_at', ''],
      ['updated_at', ''],
    ],
  },
}

// Relasi: [tabelInduk, kolomInduk(PK), tabelAnak, kolomAnak(FK), kardSrc, kardDst]
const rels = [
  ['users', 'id', 'memberships', 'user_id', '1', '1'],
  ['users', 'id', 'attendances', 'user_id', '1', 'M'],
  ['users', 'id', 'attendances', 'scanned_by', '1', 'M'],
  ['users', 'id', 'bookings', 'user_id', '1', 'M'],
  ['users', 'id', 'payments', 'user_id', '1', 'M'],
  ['users', 'id', 'payments', 'reviewed_by', '1', 'M'],
  ['instructors', 'id', 'classes', 'instructor_id', '1', 'M'],
  ['classes', 'id', 'bookings', 'class_id', '1', 'M'],
  ['classes', 'id', 'payments', 'class_id', '1', 'M'],
]

const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const W = 220
const RH = 24
const HEAD = 28

const cells = []
const rowCellId = {} // `${table}.${col}` -> id baris (titik koneksi)

for (const [name, def] of Object.entries(tables)) {
  const h = HEAD + def.fields.length * RH
  const tid = `t_${name}`
  cells.push(
    `<mxCell id="${tid}" value="${esc(name)}" style="shape=table;startSize=${HEAD};container=1;collapsible=0;childLayout=tableLayout;fixedRows=1;rowLines=1;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="${def.x}" y="${def.y}" width="${W}" height="${h}" as="geometry"/></mxCell>`,
  )
  def.fields.forEach(([col, key], i) => {
    const rid = `${tid}_r${i}`
    rowCellId[`${name}.${col}`] = rid
    cells.push(
      `<mxCell id="${rid}" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom=0;" vertex="1" parent="${tid}"><mxGeometry y="${HEAD + i * RH}" width="${W}" height="${RH}" as="geometry"/></mxCell>`,
    )
    // Markup HTML harus di-escape (&lt; &gt;) agar XML tetap valid; html=1 supaya
    // draw.io merender underline/font, bukan menampilkan tag mentah.
    // PK digarisbawahi, FK diberi penanda (FK) & dicetak miring.
    let label = esc(col)
    let fontStyle = ''
    if (key === 'PK') {
      label = `&lt;u&gt;${esc(col)}&lt;/u&gt;`
      fontStyle = 'fontStyle=1;'
    } else if (key === 'FK') {
      label = `${esc(col)} &lt;font color=&apos;#888&apos;&gt;(FK)&lt;/font&gt;`
      fontStyle = 'fontStyle=2;'
    }
    cells.push(
      `<mxCell id="${rid}_c" value="${label}" style="shape=partialRectangle;html=1;overflow=hidden;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align=left;spacingLeft=8;${fontStyle}" vertex="1" parent="${rid}"><mxGeometry width="${W}" height="${RH}" as="geometry"><mxRectangle width="${W}" height="${RH}" as="alternateBounds"/></mxGeometry></mxCell>`,
    )
  })
}

let e = 0
for (const [pt, pc, ct, cc, kSrc, kDst] of rels) {
  const src = rowCellId[`${pt}.${pc}`]
  const dst = rowCellId[`${ct}.${cc}`]
  const style =
    'edgeStyle=entityRelationEdgeStyle;fontSize=12;html=1;endArrow=none;startArrow=none;rounded=0;exitX=1;exitY=0.5;entryX=0;entryY=0.5;strokeColor=#555555;'
  cells.push(
    `<mxCell id="e_${e}" style="${style}" edge="1" parent="1" source="${src}" target="${dst}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  )
  // Label kardinalitas di kedua ujung
  cells.push(
    `<mxCell id="e_${e}_ls" value="${kSrc}" style="edgeLabel;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=12;" connectable="0" vertex="1" parent="e_${e}"><mxGeometry x="-0.85" relative="1" as="geometry"><mxPoint x="0" y="-10" as="offset"/></mxGeometry></mxCell>`,
  )
  cells.push(
    `<mxCell id="e_${e}_ld" value="${kDst}" style="edgeLabel;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=12;" connectable="0" vertex="1" parent="e_${e}"><mxGeometry x="0.85" relative="1" as="geometry"><mxPoint x="0" y="-10" as="offset"/></mxGeometry></mxCell>`,
  )
  e++
}

const xml = `<mxfile host="app.diagrams.net" type="device">
  <diagram id="heyfit-lrs" name="Heyfit LRS">
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
console.log(`OK -> ${out}  (${Object.keys(tables).length} record, ${rels.length} relasi)`)
