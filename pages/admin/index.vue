<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Dashboard Admin — Heyfit' })

interface StatsResponse {
  stats: {
    totalMembers: number
    activeMemberships: number
    expiringSoon: number
    checkInsToday: number
    newThisMonth: number
    totalClasses: number
    totalInstructors: number
  }
  activity: { nama: string, aksi: string, at: string }[]
}

const { data, pending, error, refresh } = await useFetch<StatsResponse>('/api/admin/stats')

const cards = computed(() => {
  const s = data.value?.stats
  return [
    { label: 'Total Member', value: s?.totalMembers ?? 0, hint: 'Akun ber-role member', icon: '👥', tone: 'brand' },
    { label: 'Membership Aktif', value: s?.activeMemberships ?? 0, hint: 'Belum kadaluarsa', icon: '✅', tone: 'brand' },
    { label: 'Check-in Hari Ini', value: s?.checkInsToday ?? 0, hint: 'Kehadiran tercatat', icon: '📍', tone: 'sky' },
    { label: 'Akan Kadaluarsa', value: s?.expiringSoon ?? 0, hint: 'Dalam 7 hari ke depan', icon: '⏳', tone: (s?.expiringSoon ?? 0) > 0 ? 'amber' : 'slate' },
  ]
})

const mini = computed(() => {
  const s = data.value?.stats
  return [
    { label: 'Member baru bulan ini', value: s?.newThisMonth ?? 0 },
    { label: 'Kelas aktif', value: s?.totalClasses ?? 0 },
    { label: 'Instruktur aktif', value: s?.totalInstructors ?? 0 },
  ]
})

const toneRing: Record<string, string> = {
  brand: 'text-brand-300',
  sky: 'text-sky-300',
  amber: 'text-amber-300',
  slate: 'text-slate-400',
}

const quickActions = [
  { to: '/admin/members', title: 'Manajemen Member', desc: 'Cari, edit, atur membership & hapus member.', emoji: '👤' },
  { to: '/admin/scan', title: 'Scan QR Member', desc: 'Catat kehadiran member lewat scan QR.', emoji: '📷' },
  { to: '/admin/classes', title: 'Jadwal Kelas', desc: 'Atur kelas, jadwal & kuota.', emoji: '🗓️' },
  { to: '/admin/instructors', title: 'Instruktur', desc: 'Kelola data & status instruktur.', emoji: '🏋️' },
  { to: '/admin/gallery', title: 'Galeri & Berita', desc: 'Unggah foto & berita seputar Heyfit.', emoji: '🖼️' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'Baru saja'
  if (min < 60) return `${min} menit lalu`
  const jam = Math.floor(min / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  return `${hari} hari lalu`
}
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p class="chip mb-3">Admin Console</p>
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Selamat datang kembali</h1>
        <p class="text-slate-400 mt-1">Ringkasan operasional Heyfit Fitness.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost" :disabled="pending" @click="refresh()">
          <svg class="w-4 h-4" :class="pending && 'animate-spin'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992M19.644 9.348a8.25 8.25 0 00-13.803-3.7L3 9.348m0 0V4.356m0 4.992h4.992m11.023 5.304a8.25 8.25 0 01-13.803 3.7L3 14.652m0 0v4.992" />
          </svg>
          Muat ulang
        </button>
        <NuxtLink to="/admin/members" class="btn-primary">+ Tambah Member</NuxtLink>
      </div>
    </div>

    <div v-if="error" class="card p-5 mb-6 border-rose-500/30 bg-rose-500/[0.06]">
      <p class="text-rose-300 text-sm font-semibold">Gagal memuat data dashboard.</p>
      <p class="text-slate-400 text-xs mt-1">
        Pastikan database sudah dikonfigurasi & jalankan <code class="text-brand-300">npm run db:migrate-admin</code>.
      </p>
    </div>

    <!-- stat cards -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="c in cards" :key="c.label" class="card p-5">
        <div class="flex items-start justify-between">
          <p class="text-xs uppercase tracking-widest text-slate-500">{{ c.label }}</p>
          <span class="text-lg">{{ c.icon }}</span>
        </div>
        <p class="font-display text-3xl font-extrabold text-white mt-2">
          {{ pending ? '—' : c.value.toLocaleString('id-ID') }}
        </p>
        <p :class="['mt-1 text-xs font-medium', toneRing[c.tone]]">{{ c.hint }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- recent activity -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg font-bold text-white">Aktivitas Terbaru</h2>
          <NuxtLink to="/admin/attendances" class="text-xs text-brand-300 hover:underline">Lihat kehadiran</NuxtLink>
        </div>

        <div v-if="pending" class="py-10 text-center text-slate-500 text-sm">Memuat…</div>
        <ul v-else-if="data?.activity.length" class="divide-y divide-white/[0.06]">
          <li v-for="(r, i) in data.activity" :key="i" class="py-3 flex items-center gap-4">
            <div class="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center font-bold text-ink-950 text-sm shrink-0">
              {{ r.nama.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white font-medium truncate">{{ r.nama }}</p>
              <p class="text-xs text-slate-500">{{ r.aksi }}</p>
            </div>
            <span class="text-xs text-slate-500 shrink-0">{{ timeAgo(r.at) }}</span>
          </li>
        </ul>
        <p v-else class="py-10 text-center text-slate-500 text-sm">Belum ada aktivitas.</p>
      </div>

      <!-- right column -->
      <div class="space-y-4">
        <div class="card p-6">
          <h2 class="font-display text-lg font-bold text-white mb-4">Aksi Cepat</h2>
          <div class="space-y-2">
            <NuxtLink
              v-for="a in quickActions"
              :key="a.to"
              :to="a.to"
              class="block rounded-xl border border-white/[0.06] hover:border-brand-400/40 hover:bg-white/[0.03] p-3.5 transition"
            >
              <p class="text-sm font-semibold text-white flex items-center gap-2">
                <span>{{ a.emoji }}</span> {{ a.title }}
              </p>
              <p class="text-xs text-slate-500 mt-0.5">{{ a.desc }}</p>
            </NuxtLink>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="font-display text-sm font-bold text-white mb-3">Ringkasan Lain</h2>
          <dl class="space-y-2.5">
            <div v-for="m in mini" :key="m.label" class="flex items-center justify-between gap-3">
              <dt class="text-sm text-slate-400">{{ m.label }}</dt>
              <dd class="font-display text-base font-bold text-white">{{ m.value.toLocaleString('id-ID') }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>
</template>
