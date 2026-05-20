<script setup lang="ts">
definePageMeta({ middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Admin — Heyfit' })

const stats = [
  { label: 'Member Aktif', value: '5.184', delta: '+12%', trend: 'up' },
  { label: 'Kelas Berjalan Hari Ini', value: '14', delta: '3 berjalan', trend: 'neutral' },
  { label: 'Pendaftar Baru (bln)', value: '237', delta: '+8%', trend: 'up' },
  { label: 'Occupancy Rate', value: '78%', delta: '-2%', trend: 'down' },
]

const recent = [
  { nama: 'Andi Saputra', aksi: 'Daftar member', paket: 'Tahunan', waktu: '2 menit lalu' },
  { nama: 'Sari Wijaya', aksi: 'Booking kelas', paket: 'Yoga Flow · 18:00', waktu: '12 menit lalu' },
  { nama: 'Reza Hakim', aksi: 'Perpanjang', paket: '3 Bulan', waktu: '34 menit lalu' },
  { nama: 'Mira Sanjaya', aksi: 'Booking kelas', paket: 'HIIT Burn · 17:30', waktu: '1 jam lalu' },
  { nama: 'Bayu Pratama', aksi: 'Daftar member', paket: 'Bulanan', waktu: '2 jam lalu' },
]
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p class="chip mb-3">Admin Console</p>
        <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-white">Selamat datang kembali</h1>
        <p class="text-slate-400 mt-1">Ringkasan operasional Heyfit Fitness.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost">Export CSV</button>
        <button class="btn-primary">+ Tambah Member</button>
      </div>
    </div>

    <!-- stats -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="s in stats" :key="s.label" class="card p-5">
        <p class="text-xs uppercase tracking-widest text-slate-500">{{ s.label }}</p>
        <p class="font-display text-3xl font-extrabold text-white mt-2">{{ s.value }}</p>
        <p
          :class="[
            'mt-1 text-xs font-medium inline-flex items-center gap-1',
            s.trend === 'up' && 'text-brand-300',
            s.trend === 'down' && 'text-rose-400',
            s.trend === 'neutral' && 'text-slate-400',
          ]"
        >
          <span v-if="s.trend === 'up'">▲</span>
          <span v-else-if="s.trend === 'down'">▼</span>
          <span v-else>●</span>
          {{ s.delta }}
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- recent activity -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-bold text-white">Aktivitas Terbaru</h2>
          <button class="text-xs text-brand-300 hover:underline">Lihat semua</button>
        </div>
        <ul class="divide-y divide-white/[0.06]">
          <li v-for="r in recent" :key="r.nama + r.waktu" class="py-3 flex items-center gap-4">
            <div class="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center font-bold text-ink-950 text-sm shrink-0">
              {{ r.nama.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white font-medium truncate">{{ r.nama }}</p>
              <p class="text-xs text-slate-500">{{ r.aksi }} · {{ r.paket }}</p>
            </div>
            <span class="text-xs text-slate-500 shrink-0">{{ r.waktu }}</span>
          </li>
        </ul>
      </div>

      <!-- quick actions -->
      <div class="card p-6">
        <h2 class="font-display text-lg font-bold text-white mb-4">Aksi Cepat</h2>
        <div class="space-y-2">
          <button class="w-full text-left rounded-xl border border-white/[0.06] hover:border-brand-400/40 hover:bg-white/[0.03] p-4 transition group">
            <p class="text-sm font-semibold text-white">Manajemen Member</p>
            <p class="text-xs text-slate-500 mt-0.5">Lihat, edit, dan suspend member.</p>
          </button>
          <button class="w-full text-left rounded-xl border border-white/[0.06] hover:border-brand-400/40 hover:bg-white/[0.03] p-4 transition">
            <p class="text-sm font-semibold text-white">Jadwal Kelas</p>
            <p class="text-xs text-slate-500 mt-0.5">Atur jadwal & kuota kelas.</p>
          </button>
          <button class="w-full text-left rounded-xl border border-white/[0.06] hover:border-brand-400/40 hover:bg-white/[0.03] p-4 transition">
            <p class="text-sm font-semibold text-white">Instruktur</p>
            <p class="text-xs text-slate-500 mt-0.5">Onboarding & jadwal instruktur.</p>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
