// Generator file .drawio (mxGraph XML) untuk Class Diagram (UML) Heyfit Fitness.
// Jalankan: node scripts/generate-class-drawio.mjs
// Output  : docs/heyfit-class.drawio  (import via draw.io: File > Open / Import)
//
// Diagram memodelkan dua lapisan:
//  - Entity  : kelas data turunan skema Drizzle (server/database/schema.ts)
//  - Service : kelas control/business-logic turunan server/utils + endpoint API
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../docs/heyfit-class.drawio')

// Definisi kelas.
// stereotype : '«entity»' | '«service»' (opsional, tampil di atas nama)
// attrs      : daftar atribut  '- nama: tipe'
// methods    : daftar operasi  '+ nama(arg): tipe'
const classes = {
  // ── Lapisan Entity ─────────────────────────────────────────────
  User: {
    x: 40, y: 40, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- nama: string',
      '- email: string',
      '- passwordHash: string',
      '- role: Role «member|admin|owner»',
      '- qrToken: string',
      '- createdAt: Date',
    ],
    methods: [
      '+ isAdmin(): boolean',
    ],
  },
  Membership: {
    x: 40, y: 360, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- userId: int',
      '- paket: Paket «bulanan|3bulan|tahunan»',
      '- mulai: date',
      '- berakhir: date',
      '- status: «aktif|kadaluarsa»',
      '- createdAt: Date',
      '- updatedAt: Date',
    ],
    methods: [
      '+ sisaHari(): int',
      '+ isActive(): boolean',
    ],
  },
  Attendance: {
    x: 40, y: 720, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- userId: int',
      '- scannedBy: int',
      '- createdAt: Date',
    ],
    methods: [],
  },
  Instructor: {
    x: 360, y: 40, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- nama: string',
      '- spesialisasi: string',
      '- bio: string',
      '- aktif: boolean',
      '- createdAt: Date',
    ],
    methods: [],
  },
  GymClass: {
    x: 360, y: 320, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- nama: string',
      '- kategori: «Mind&Body|Cardio|Strength|Dance»',
      '- instructorId: int',
      '- jadwal: string',
      '- durasiMenit: int',
      '- kuota: int',
      '- intensitas: int (1-3)',
      '- harga: int',
      '- masaBerlakuHari: int',
      '- aktif: boolean',
      '- createdAt: Date',
    ],
    methods: [
      '+ slotTersisa(): int',
    ],
  },
  Booking: {
    x: 360, y: 800, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- classId: int',
      '- userId: int',
      '- berlakuSampai: date',
      '- createdAt: Date',
    ],
    methods: [
      '+ isActive(): boolean',
    ],
  },
  Payment: {
    x: 700, y: 360, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- userId: int',
      '- jenis: «membership|kelas»',
      '- paket: Paket',
      '- classId: int',
      '- nominal: int',
      '- metode: «transfer»',
      '- buktiTransfer: string',
      '- catatan: string',
      '- status: «menunggu|disetujui|ditolak»',
      '- catatanAdmin: string',
      '- reviewedBy: int',
      '- reviewedAt: Date',
      '- createdAt: Date',
    ],
    methods: [
      '+ approve(adminId): void',
      '+ reject(adminId): void',
    ],
  },
  Gallery: {
    x: 700, y: 40, stereotype: '«entity»',
    attrs: [
      '- id: int',
      '- judul: string',
      '- kategori: string',
      '- ringkasan: string',
      '- konten: string',
      '- gambar: string',
      '- tampil: boolean',
      '- createdAt: Date',
      '- updatedAt: Date',
    ],
    methods: [],
  },

  // ── Lapisan Service / Control ──────────────────────────────────
  AuthService: {
    x: 1060, y: 40, stereotype: '«service»',
    attrs: [],
    methods: [
      '+ register(nama, email, pw): User',
      '+ login(email, pw): Session',
      '+ logout(): void',
      '- hashUserPassword(pw): string',
      '- verifyUserPassword(hash, pw): boolean',
      '+ requireAdmin(event): User',
    ],
  },
  MembershipService: {
    x: 1060, y: 320, stereotype: '«service»',
    attrs: [],
    methods: [
      '+ applyMembership(userId, paket): Membership',
      '+ isPaket(value): boolean',
      '+ daysUntil(date): int',
      '+ addDays(base, days): Date',
    ],
  },
  BookingService: {
    x: 1060, y: 560, stereotype: '«service»',
    attrs: [],
    methods: [
      '+ book(classId, userId): Booking',
      '+ cancel(classId, userId): void',
      '+ computeBerlakuSampai(hari): date',
      '+ bookingMasihAktif(date): boolean',
    ],
  },
  PaymentService: {
    x: 1060, y: 800, stereotype: '«service»',
    attrs: [],
    methods: [
      '+ submit(userId, jenis, bukti): Payment',
      '+ review(id, adminId, status): void',
      '- validateBuktiTransfer(value): string',
      '- parseCatatan(value): string',
    ],
  },
  AttendanceService: {
    x: 1400, y: 320, stereotype: '«service»',
    attrs: [],
    methods: [
      '+ scan(qrToken, adminId): Attendance',
    ],
  },
  QrService: {
    x: 1400, y: 520, stereotype: '«service»',
    attrs: [],
    methods: [
      '+ generateQrToken(): string',
      '+ qrTokenToDataUrl(token): string',
    ],
  },
}

// Relasi.
// type: 'assoc' (asosiasi, multiplicity) | 'dep' (dependency «use», putus-putus)
// [src, dst, type, label, srcMult, dstMult]
const rels = [
  // Asosiasi antar-entity (mengikuti FK level aplikasi)
  ['User', 'Membership', 'assoc', 'punya', '1', '0..1'],
  ['User', 'Attendance', 'assoc', 'hadir', '1', '0..*'],
  ['User', 'Booking', 'assoc', 'memesan', '1', '0..*'],
  ['User', 'Payment', 'assoc', 'mengajukan', '1', '0..*'],
  ['Instructor', 'GymClass', 'assoc', 'mengajar', '0..1', '0..*'],
  ['GymClass', 'Booking', 'assoc', 'dipesan', '1', '0..*'],
  ['GymClass', 'Payment', 'assoc', 'dibayar', '0..1', '0..*'],

  // Dependency Service -> Entity (mengelola / memakai)
  ['AuthService', 'User', 'dep', '', '', ''],
  ['MembershipService', 'Membership', 'dep', '', '', ''],
  ['BookingService', 'Booking', 'dep', '', '', ''],
  ['BookingService', 'GymClass', 'dep', '', '', ''],
  ['PaymentService', 'Payment', 'dep', '', '', ''],
  ['PaymentService', 'Membership', 'dep', '«approve»', '', ''],
  ['AttendanceService', 'Attendance', 'dep', '', '', ''],
  ['AttendanceService', 'User', 'dep', '', '', ''],
  ['QrService', 'User', 'dep', '', '', ''],
]

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const W = 300
const HEAD = 30
const ROW = 22
const DIV = 8

const cells = []

for (const [name, def] of Object.entries(classes)) {
  const attrs = def.attrs ?? []
  const methods = def.methods ?? []
  const h = HEAD + attrs.length * ROW + DIV + methods.length * ROW
  const cid = `c_${name}`
  const title = def.stereotype ? `${def.stereotype}&#10;${name}` : name
  const fill = def.stereotype === '«service»' ? '#d5e8d4' : '#dae8fc'
  const stroke = def.stereotype === '«service»' ? '#82b366' : '#6c8ebf'

  cells.push(
    `<mxCell id="${cid}" value="${esc(title)}" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=${HEAD};horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=${stroke};" vertex="1" parent="1"><mxGeometry x="${def.x}" y="${def.y}" width="${W}" height="${h}" as="geometry"/></mxCell>`,
  )

  let y = HEAD
  attrs.forEach((a, i) => {
    cells.push(
      `<mxCell id="${cid}_a${i}" value="${esc(a)}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;html=1;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="${cid}"><mxGeometry y="${y}" width="${W}" height="${ROW}" as="geometry"/></mxCell>`,
    )
    y += ROW
  })

  // Garis pemisah atribut / metode
  cells.push(
    `<mxCell id="${cid}_div" value="" style="line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;" vertex="1" parent="${cid}"><mxGeometry y="${y}" width="${W}" height="${DIV}" as="geometry"/></mxCell>`,
  )
  y += DIV

  methods.forEach((m, i) => {
    cells.push(
      `<mxCell id="${cid}_m${i}" value="${esc(m)}" style="text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=6;spacingRight=6;overflow=hidden;rotatable=0;html=1;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;" vertex="1" parent="${cid}"><mxGeometry y="${y}" width="${W}" height="${ROW}" as="geometry"/></mxCell>`,
    )
    y += ROW
  })
}

let e = 0
for (const [src, dst, type, label, sMult, dMult] of rels) {
  const sid = `c_${src}`
  const did = `c_${dst}`
  const style = type === 'dep'
    ? 'endArrow=open;dashed=1;html=1;edgeStyle=orthogonalEdgeStyle;rounded=0;'
    : 'endArrow=none;html=1;edgeStyle=orthogonalEdgeStyle;rounded=0;'
  const eid = `e_${e}`
  cells.push(
    `<mxCell id="${eid}" value="${esc(label)}" style="${style}" edge="1" parent="1" source="${sid}" target="${did}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  )
  // Label multiplicity di ujung edge (khusus asosiasi)
  if (sMult) {
    cells.push(
      `<mxCell id="${eid}_s" value="${esc(sMult)}" style="resizable=0;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" connectable="0" parent="${eid}"><mxGeometry x="-0.85" relative="1" as="geometry"><mxPoint x="0" y="-8" as="offset"/></mxGeometry></mxCell>`,
    )
  }
  if (dMult) {
    cells.push(
      `<mxCell id="${eid}_d" value="${esc(dMult)}" style="resizable=0;html=1;align=center;verticalAlign=middle;fontSize=11;" vertex="1" connectable="0" parent="${eid}"><mxGeometry x="0.85" relative="1" as="geometry"><mxPoint x="0" y="-8" as="offset"/></mxGeometry></mxCell>`,
    )
  }
  e++
}

const xml = `<mxfile host="app.diagrams.net" type="device">
  <diagram id="heyfit-class" name="Heyfit Class Diagram">
    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2000" pageHeight="1400" math="0" shadow="0">
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
const nClass = Object.keys(classes).length
console.log(`OK -> ${out}  (${nClass} kelas, ${rels.length} relasi)`)
