// Generator file .drawio (mxGraph XML) untuk Use Case Diagram Heyfit Fitness.
// Jalankan: node scripts/generate-usecase-drawio.mjs
// Output  : docs/heyfit-usecase.drawio  (buka via draw.io: File > Open)
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '../docs/heyfit-usecase.drawio')

const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// ── Aktor ───────────────────────────────────────────────────────────────────
// id, nama, x, y  (stick figure, label di bawah)
const actors = [
  { id: 'aGuest', nama: 'Pengunjung', x: 120, y: 200 },
  { id: 'aMember', nama: 'Member', x: 120, y: 600 },
  { id: 'aAdmin', nama: 'Admin', x: 1740, y: 320 },
  { id: 'aOwner', nama: 'Owner', x: 1740, y: 840 },
]

// ── Use case ─────────────────────────────────────────────────────────────────
// id, nama, x, y  (ellipse). Posisi absolut, dikelompokkan per kolom.
const UC_W = 210
const UC_H = 56
const usecases = [
  // Kolom A — Publik & Autentikasi
  { id: 'ucLanding', nama: 'Lihat Landing Page', x: 410, y: 120 },
  { id: 'ucGaleri', nama: 'Lihat Galeri', x: 410, y: 210 },
  { id: 'ucFasilitas', nama: 'Lihat Fasilitas', x: 410, y: 300 },
  { id: 'ucRegister', nama: 'Registrasi Akun', x: 410, y: 420 },
  { id: 'ucLogin', nama: 'Login', x: 410, y: 540 },
  { id: 'ucLogout', nama: 'Logout', x: 410, y: 630 },
  // Kolom B — Member
  { id: 'ucDashMember', nama: 'Lihat Dashboard Member', x: 770, y: 120 },
  { id: 'ucDaftarKelas', nama: 'Lihat Daftar Kelas', x: 770, y: 210 },
  { id: 'ucPesanKelas', nama: 'Pesan / Booking Kelas', x: 770, y: 300 },
  { id: 'ucBatalBooking', nama: 'Batalkan Booking Kelas', x: 770, y: 390 },
  { id: 'ucKeanggotaan', nama: 'Daftar / Perpanjang Keanggotaan', x: 770, y: 500 },
  { id: 'ucBayar', nama: 'Ajukan Pembayaran (upload bukti)', x: 770, y: 620 },
  { id: 'ucRiwayatBayar', nama: 'Lihat Riwayat Pembayaran', x: 770, y: 710 },
  { id: 'ucQR', nama: 'Tampilkan QR Absensi', x: 770, y: 800 },
  // Kolom C — Admin & Owner
  { id: 'ucKelolaMember', nama: 'Kelola Data Member', x: 1150, y: 120 },
  { id: 'ucKelolaKelas', nama: 'Kelola Kelas', x: 1150, y: 210 },
  { id: 'ucKelolaInstruktur', nama: 'Kelola Instruktur', x: 1150, y: 300 },
  { id: 'ucKelolaGaleri', nama: 'Kelola Galeri', x: 1150, y: 390 },
  { id: 'ucScanQR', nama: 'Scan QR Absensi', x: 1150, y: 480 },
  { id: 'ucLihatAbsensi', nama: 'Lihat Absensi', x: 1150, y: 570 },
  { id: 'ucTinjauBayar', nama: 'Tinjau Pembayaran (setujui / tolak)', x: 1150, y: 660 },
  { id: 'ucKelolaKeanggotaan', nama: 'Kelola Keanggotaan Member', x: 1150, y: 750 },
  { id: 'ucStatistik', nama: 'Lihat Statistik & Dashboard', x: 1150, y: 860 },
  { id: 'ucLaporan', nama: 'Pantau Laporan Bisnis', x: 1150, y: 950 },
]

// ── Asosiasi aktor → use case ────────────────────────────────────────────────
const assoc = {
  aGuest: ['ucLanding', 'ucGaleri', 'ucFasilitas', 'ucDaftarKelas', 'ucRegister', 'ucLogin'],
  aMember: [
    'ucLogin', 'ucLogout', 'ucDashMember', 'ucGaleri', 'ucFasilitas',
    'ucDaftarKelas', 'ucPesanKelas', 'ucBatalBooking', 'ucKeanggotaan',
    'ucBayar', 'ucRiwayatBayar', 'ucQR',
  ],
  aAdmin: [
    'ucLogin', 'ucLogout', 'ucKelolaMember', 'ucKelolaKelas', 'ucKelolaInstruktur',
    'ucKelolaGaleri', 'ucScanQR', 'ucLihatAbsensi', 'ucTinjauBayar',
    'ucKelolaKeanggotaan', 'ucStatistik',
  ],
  aOwner: ['ucLogin', 'ucLogout', 'ucStatistik', 'ucLaporan', 'ucKelolaMember'],
}

// ── Dependency «include» / «extend» (use case → use case) ────────────────────
// [from, to, type]  type: 'include' | 'extend'
const deps = [
  ['ucPesanKelas', 'ucBayar', 'include'],
  ['ucKeanggotaan', 'ucBayar', 'include'],
  ['ucTinjauBayar', 'ucKelolaKeanggotaan', 'include'],
  ['ucPesanKelas', 'ucLogin', 'include'],
]

// ── Bangun cells ─────────────────────────────────────────────────────────────
const cells = []

// System boundary (digambar pertama → berada di belakang)
const BX = 360, BY = 80, BW = 1310, BH = 990
cells.push(
  `<mxCell id="boundary" value="Sistem Heyfit Fitness" style="rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;fontSize=16;fontStyle=1;fillColor=none;strokeColor=#666666;spacingTop=8;" vertex="1" parent="1"><mxGeometry x="${BX}" y="${BY}" width="${BW}" height="${BH}" as="geometry"/></mxCell>`,
)

// Aktor
for (const a of actors) {
  cells.push(
    `<mxCell id="${a.id}" value="${esc(a.nama)}" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fontStyle=1;fontSize=13;outlineConnect=0;" vertex="1" parent="1"><mxGeometry x="${a.x}" y="${a.y}" width="40" height="80" as="geometry"/></mxCell>`,
  )
}

// Use case
for (const u of usecases) {
  cells.push(
    `<mxCell id="${u.id}" value="${esc(u.nama)}" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="${u.x}" y="${u.y}" width="${UC_W}" height="${UC_H}" as="geometry"/></mxCell>`,
  )
}

// Edge: asosiasi (garis polos)
let e = 0
for (const [aid, list] of Object.entries(assoc)) {
  for (const uc of list) {
    cells.push(
      `<mxCell id="as_${e}" style="endArrow=none;html=1;rounded=0;strokeColor=#555555;" edge="1" parent="1" source="${aid}" target="${uc}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    )
    e++
  }
}

// Edge: «include» / «extend» (panah putus-putus berlabel)
let d = 0
for (const [from, to, type] of deps) {
  cells.push(
    `<mxCell id="dep_${d}" value="&#171;${type}&#187;" style="endArrow=open;endFill=0;dashed=1;html=1;rounded=0;fontSize=11;fontStyle=2;strokeColor=#9673a6;fontColor=#6a4a86;" edge="1" parent="1" source="${from}" target="${to}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
  )
  d++
}

const xml = `<mxfile host="app.diagrams.net" type="device">
  <diagram id="heyfit-usecase" name="Heyfit Use Case">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1900" pageHeight="1200" math="0" shadow="0">
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
console.log(
  `OK -> ${out}  (${actors.length} aktor, ${usecases.length} use case, ${e} asosiasi, ${d} include/extend)`,
)
