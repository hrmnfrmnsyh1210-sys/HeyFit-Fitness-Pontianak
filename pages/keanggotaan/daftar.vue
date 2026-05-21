<script setup lang="ts">
useHead({ title: 'Aktivasi Membership — Heyfit' })

const { loggedIn } = useUserSession()
const route = useRoute()

// Overview hanya di-fetch kalau sudah login.
const { data: overview, refresh } = await useFetch('/api/member/overview', {
  immediate: loggedIn.value,
  default: () => null,
})

type Paket = 'bulanan' | '3bulan' | 'tahunan'

const paketList: { id: Paket, label: string, harga: string, highlight?: boolean, perks: string[] }[] = [
  {
    id: 'bulanan',
    label: 'Bulanan',
    harga: 'Rp 250rb',
    perks: ['Akses gym 24/7', '2 kelas/bulan', 'Locker harian'],
  },
  {
    id: '3bulan',
    label: '3 Bulan',
    harga: 'Rp 700rb',
    highlight: true,
    perks: ['Akses gym 24/7', '10 kelas/bulan', 'Locker pribadi', 'Free 1x personal training'],
  },
  {
    id: 'tahunan',
    label: 'Tahunan',
    harga: 'Rp 2.4jt',
    perks: ['Semua benefit 3 bulan', 'Unlimited kelas', 'Akses sauna', 'Free apparel pack'],
  },
]

const pilihan = ref<Paket>('3bulan')
const membership = computed(() => overview.value?.membership ?? null)
const sudahAktif = computed(() => Boolean(membership.value?.aktif))

function formatTanggal(str: string) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const loading = ref(false)
const errorMsg = ref('')
const submitted = ref(false)
const result = ref<{ berakhir: string, sisaHari: number } | null>(null)

async function aktivasi() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await $fetch('/api/member/membership', {
      method: 'POST',
      body: { paket: pilihan.value },
    })
    result.value = res.membership
    submitted.value = true
    await refresh()
  }
  catch (err) {
    errorMsg.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal aktivasi. Coba lagi.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <p class="chip-accent mb-4"><span class="glow-dot" />Mulai keanggotaanmu</p>
      <h1 class="font-display text-4xl sm:text-5xl font-extrabold text-white">
        Pilih paket. <span class="text-gradient">Aktifkan sekarang.</span>
      </h1>
      <p class="mt-4 text-slate-400">
        Tanpa biaya pendaftaran. Tanpa kontrak panjang.
      </p>
    </div>

    <!-- SUKSES -->
    <div v-if="submitted && result" class="max-w-xl mx-auto card p-10 text-center">
      <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/20 text-brand-300 shadow-glow">
        <svg class="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="font-display text-2xl font-extrabold text-white mb-2">Membership aktif!</h2>
      <p class="text-slate-400">
        Berlaku sampai <span class="text-brand-300 font-semibold">{{ formatTanggal(result.berakhir) }}</span>
        ({{ result.sisaHari }} hari).
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/dashboard" class="btn-primary">Ke Dashboard</NuxtLink>
        <NuxtLink to="/kelas" class="btn-ghost">Booking kelas</NuxtLink>
      </div>
    </div>

    <!-- BELUM LOGIN -->
    <div v-else-if="!loggedIn" class="max-w-xl mx-auto card p-8 text-center">
      <h2 class="font-display text-xl font-bold text-white mb-2">Buat akun dulu</h2>
      <p class="text-sm text-slate-400 mb-6">
        Untuk mengaktifkan membership, kamu perlu akun Heyfit terlebih dahulu.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink to="/register" class="btn-primary">Daftar Akun</NuxtLink>
        <NuxtLink :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`" class="btn-ghost">
          Sudah punya akun
        </NuxtLink>
      </div>
    </div>

    <!-- SUDAH PUNYA MEMBERSHIP AKTIF -->
    <div v-else-if="sudahAktif && membership" class="max-w-xl mx-auto card p-8 text-center border-brand-400/30 bg-brand-400/[0.05]">
      <h2 class="font-display text-xl font-bold text-white mb-2">Membership-mu sudah aktif</h2>
      <p class="text-sm text-slate-400 mb-6">
        Paket {{ membership.paket }} berlaku sampai {{ formatTanggal(membership.berakhir) }}
        ({{ membership.sisaHari }} hari lagi).
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink to="/dashboard" class="btn-primary">Ke Dashboard</NuxtLink>
        <NuxtLink to="/keanggotaan/perpanjang" class="btn-ghost">Perpanjang</NuxtLink>
      </div>
    </div>

    <!-- PILIH PAKET -->
    <div v-else>
      <div class="grid md:grid-cols-3 gap-4 mb-8">
        <button
          v-for="p in paketList"
          :key="p.id"
          type="button"
          :class="[
            'card-hover p-6 text-left flex flex-col',
            pilihan === p.id ? 'border-brand-400/60 bg-brand-400/[0.08] shadow-glow' : '',
            p.highlight && pilihan !== p.id ? 'border-white/15' : '',
          ]"
          @click="pilihan = p.id"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-display text-lg font-bold text-white">{{ p.label }}</h3>
            <span v-if="p.highlight" class="chip-accent">Populer</span>
          </div>
          <p class="font-display text-3xl font-extrabold text-white">{{ p.harga }}</p>
          <ul class="mt-5 space-y-2 text-sm text-slate-400 flex-1">
            <li v-for="perk in p.perks" :key="perk" class="flex items-start gap-2">
              <svg class="w-4 h-4 text-brand-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd" />
              </svg>
              {{ perk }}
            </li>
          </ul>
          <div class="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <span :class="pilihan === p.id ? 'glow-dot' : 'h-1.5 w-1.5 rounded-full bg-white/20'" />
            {{ pilihan === p.id ? 'Dipilih' : 'Klik untuk pilih' }}
          </div>
        </button>
      </div>

      <div class="max-w-xl mx-auto">
        <div
          v-if="errorMsg"
          class="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {{ errorMsg }}
        </div>
        <button :disabled="loading" class="btn-primary w-full" @click="aktivasi">
          <span v-if="!loading">Aktifkan Paket {{ paketList.find(p => p.id === pilihan)?.label }}</span>
          <span v-else>Memproses…</span>
        </button>
        <p class="mt-3 text-xs text-center text-slate-500">
          Demo — pembayaran belum terhubung. Membership langsung aktif setelah konfirmasi.
        </p>
      </div>
    </div>
  </section>
</template>
