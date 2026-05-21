<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Dashboard — Heyfit' })

const { data, pending } = await useFetch('/api/member/overview')

const paketInfo: Record<string, { label: string, durasi: number }> = {
  bulanan: { label: 'Bulanan', durasi: 30 },
  '3bulan': { label: '3 Bulan', durasi: 90 },
  tahunan: { label: 'Tahunan', durasi: 365 },
}

const roleLabel: Record<string, string> = {
  member: 'Member', admin: 'Admin', owner: 'Owner',
}

const membership = computed(() => data.value?.membership ?? null)
const profil = computed(() => data.value?.user ?? null)
const qr = computed(() => data.value?.qr ?? null)

function formatTanggal(str: string) {
  return new Date(str).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Persentase sisa masa aktif untuk progress bar.
const sisaPersen = computed(() => {
  const m = membership.value
  if (!m || !m.aktif) return 0
  const total = paketInfo[m.paket]?.durasi ?? 30
  return Math.max(0, Math.min(100, Math.round((m.sisaHari / total) * 100)))
})

// Kelas yang sudah dibooking member — diambil dari database.
const { data: bookingData } = await useFetch('/api/member/bookings')
const bookings = computed(() => bookingData.value?.data ?? [])

// ─── Data contoh (belum DB-backed) ───────────────────────────
const statsContoh = [
  { label: 'Kelas bulan ini', value: '8' },
  { label: 'Total kelas', value: '47' },
  { label: 'Streak', value: '12 hari' },
]
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- header -->
    <div class="mb-8">
      <p class="chip-accent mb-3"><span class="glow-dot" />Member Area</p>
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-white">
        Halo, {{ profil?.nama?.split(' ')[0] ?? 'Member' }} 👋
      </h1>
      <p class="text-slate-400 mt-1">Ini ringkasan akun kebugaranmu.</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- KARTU MEMBERSHIP -->
      <div class="lg:col-span-2">
        <!-- loading -->
        <div v-if="pending" class="card p-8 animate-pulse">
          <div class="h-4 w-32 bg-white/10 rounded mb-4" />
          <div class="h-8 w-48 bg-white/10 rounded" />
        </div>

        <!-- aktif -->
        <div
          v-else-if="membership && membership.aktif"
          class="relative card overflow-hidden p-7 lg:p-8 border-brand-400/30 bg-brand-400/[0.05]"
        >
          <div class="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />
          <div class="relative">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs uppercase tracking-widest text-brand-300">Membership aktif</p>
                <p class="font-display text-3xl font-extrabold text-white mt-1">
                  Paket {{ paketInfo[membership.paket]?.label ?? membership.paket }}
                </p>
              </div>
              <span class="chip-accent">{{ membership.sisaHari }} hari lagi</span>
            </div>

            <div class="mt-6 h-2 rounded-full bg-white/10 overflow-hidden">
              <div class="h-full rounded-full bg-brand-400" :style="{ width: `${sisaPersen}%` }" />
            </div>

            <div class="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-slate-500 text-xs uppercase tracking-widest mb-1">Mulai</p>
                <p class="text-white font-medium">{{ formatTanggal(membership.mulai) }}</p>
              </div>
              <div>
                <p class="text-slate-500 text-xs uppercase tracking-widest mb-1">Berakhir</p>
                <p class="text-white font-medium">{{ formatTanggal(membership.berakhir) }}</p>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <NuxtLink to="/keanggotaan/perpanjang" class="btn-primary">Perpanjang</NuxtLink>
              <NuxtLink to="/kelas" class="btn-ghost">Booking kelas</NuxtLink>
            </div>
          </div>
        </div>

        <!-- kadaluarsa -->
        <div
          v-else-if="membership && !membership.aktif"
          class="card p-7 lg:p-8 border-rose-500/30 bg-rose-500/[0.05]"
        >
          <p class="text-xs uppercase tracking-widest text-rose-300">Membership kadaluarsa</p>
          <p class="font-display text-2xl font-extrabold text-white mt-1">
            Berakhir {{ formatTanggal(membership.berakhir) }}
          </p>
          <p class="text-sm text-slate-400 mt-2">
            Membership-mu sudah berakhir {{ Math.abs(membership.sisaHari) }} hari lalu.
            Perpanjang untuk lanjut akses gym & kelas.
          </p>
          <NuxtLink to="/keanggotaan/perpanjang" class="btn-primary mt-5">Perpanjang sekarang</NuxtLink>
        </div>

        <!-- belum punya -->
        <div v-else class="card p-7 lg:p-8">
          <p class="text-xs uppercase tracking-widest text-slate-500">Status membership</p>
          <p class="font-display text-2xl font-extrabold text-white mt-1">Belum aktif</p>
          <p class="text-sm text-slate-400 mt-2">
            Kamu belum punya membership. Aktifkan sekarang untuk mulai akses gym dan kelas.
          </p>
          <NuxtLink to="/keanggotaan/daftar" class="btn-primary mt-5">Aktifkan Membership</NuxtLink>
        </div>

        <!-- stats contoh -->
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div v-for="s in statsContoh" :key="s.label" class="card p-5">
            <p class="font-display text-2xl font-extrabold text-white">{{ s.value }}</p>
            <p class="text-xs uppercase tracking-widest text-slate-500 mt-1">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <!-- KARTU PROFIL -->
      <div class="card p-6 h-fit">
        <div class="flex items-center gap-3 pb-5 border-b border-white/[0.06]">
          <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-display text-lg font-extrabold">
            {{ profil?.nama?.charAt(0).toUpperCase() ?? '?' }}
          </span>
          <div class="min-w-0">
            <p class="text-white font-semibold truncate">{{ profil?.nama }}</p>
            <p class="text-xs text-slate-500">{{ roleLabel[profil?.role ?? 'member'] }}</p>
          </div>
        </div>
        <dl class="py-4 space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500">Email</dt>
            <dd class="text-slate-200 truncate">{{ profil?.email }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-slate-500">ID Member</dt>
            <dd class="text-slate-200">HF-{{ String(profil?.id ?? 0).padStart(5, '0') }}</dd>
          </div>
        </dl>

        <div class="pt-4 border-t border-white/[0.06] space-y-2">
          <NuxtLink to="/kelas" class="block rounded-xl border border-white/[0.06] hover:border-brand-400/40 hover:bg-white/[0.03] p-3 text-sm text-white transition">
            Booking kelas baru
          </NuxtLink>
          <NuxtLink to="/fasilitas" class="block rounded-xl border border-white/[0.06] hover:border-brand-400/40 hover:bg-white/[0.03] p-3 text-sm text-white transition">
            Lihat fasilitas
          </NuxtLink>
        </div>

        <!-- QR CHECK-IN -->
        <div class="pt-4 mt-4 border-t border-white/[0.06]">
          <div class="flex items-center justify-between mb-1">
            <p class="text-sm font-semibold text-white">QR Check-in</p>
            <span class="chip-accent">Scan di gym</span>
          </div>
          <p class="text-xs text-slate-500 mb-3">
            Tunjukkan QR ini ke admin untuk mencatat kehadiranmu.
          </p>
          <div v-if="pending" class="aspect-square rounded-2xl bg-white/5 animate-pulse" />
          <div v-else-if="qr" class="rounded-2xl bg-white p-3">
            <img :src="qr.image" alt="QR check-in member" class="w-full h-auto" width="320" height="320">
          </div>
          <p v-if="qr" class="mt-2 text-center font-mono text-[11px] tracking-wider text-slate-500 break-all">
            {{ qr.token }}
          </p>
        </div>
      </div>
    </div>

    <!-- KELAS YANG SUDAH DIBOOKING -->
    <div class="card p-6 mt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display text-lg font-bold text-white">Kelas yang Kamu Booking</h2>
        <span class="chip">{{ bookings.length }} kelas</span>
      </div>

      <ul v-if="bookings.length" class="divide-y divide-white/[0.06]">
        <li v-for="b in bookings" :key="b.bookingId" class="py-3 flex items-center gap-4">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500/30 to-ink-900 border border-white/10 flex items-center justify-center text-brand-300 font-bold shrink-0">
            {{ b.nama.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white font-medium truncate">{{ b.nama }}</p>
            <p class="text-xs text-slate-500">
              w/ {{ b.instrukturNama ?? 'Pelatih segera diumumkan' }} · {{ b.kategori }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-sm text-white">{{ b.jadwal }}</p>
            <p class="text-xs text-slate-500">{{ b.durasiMenit }} menit</p>
          </div>
        </li>
      </ul>

      <div v-else class="py-8 text-center">
        <p class="text-sm text-slate-400 mb-3">Kamu belum booking kelas apa pun.</p>
        <NuxtLink to="/kelas" class="btn-primary">Cari kelas</NuxtLink>
      </div>
    </div>
  </section>
</template>
