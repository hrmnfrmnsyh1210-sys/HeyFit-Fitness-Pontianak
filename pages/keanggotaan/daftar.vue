<script setup lang="ts">
useHead({ title: 'Aktivasi Membership — Heyfit' })

const { loggedIn } = useUserSession()
const route = useRoute()

type Paket = 'bulanan' | '3bulan' | 'tahunan'

// Data di-fetch hanya kalau sudah login.
const { data: overview } = await useFetch('/api/member/overview', {
  immediate: loggedIn.value,
  default: () => null,
})
const { data: paymentsData, refresh: refreshPayments } = await useFetch('/api/member/payments', {
  immediate: loggedIn.value,
  default: () => ({ data: [] }),
})

const paketList: { id: Paket, label: string, harga: number, highlight?: boolean, perks: string[] }[] = [
  {
    id: 'bulanan',
    label: 'Bulanan',
    harga: 250_000,
    perks: ['Akses gym 24/7', '2 kelas/bulan', 'Locker harian'],
  },
  {
    id: '3bulan',
    label: '3 Bulan',
    harga: 700_000,
    highlight: true,
    perks: ['Akses gym 24/7', '10 kelas/bulan', 'Locker pribadi', 'Free 1x personal training'],
  },
  {
    id: 'tahunan',
    label: 'Tahunan',
    harga: 2_400_000,
    perks: ['Semua benefit 3 bulan', 'Unlimited kelas', 'Akses sauna', 'Free apparel pack'],
  },
]

const pilihan = ref<Paket>('3bulan')
const paketDipilih = computed(() => paketList.find(p => p.id === pilihan.value)!)
const membership = computed(() => overview.value?.membership ?? null)
const sudahAktif = computed(() => Boolean(membership.value?.aktif))
const pendingMembership = computed(() =>
  (paymentsData.value?.data ?? []).find(p => p.jenis === 'membership' && p.status === 'menunggu') ?? null,
)

// form pembayaran
const buktiTransfer = ref('')
const catatan = ref('')
const loading = ref(false)
const errorMsg = ref('')
const submitted = ref(false)

async function ajukan() {
  errorMsg.value = ''
  if (!buktiTransfer.value) {
    errorMsg.value = 'Unggah bukti transfer terlebih dahulu.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/member/membership', {
      method: 'POST',
      body: {
        paket: pilihan.value,
        buktiTransfer: buktiTransfer.value,
        catatan: catatan.value,
      },
    })
    submitted.value = true
    buktiTransfer.value = ''
    catatan.value = ''
    await refreshPayments()
  }
  catch (err) {
    errorMsg.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal mengirim pengajuan. Coba lagi.'
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
        Pilih paket. <span class="text-gradient">Bayar. Aktif.</span>
      </h1>
      <p class="mt-4 text-slate-400">
        Transfer ke rekening resmi, unggah bukti, lalu admin akan mengonfirmasi membership-mu.
      </p>
    </div>

    <!-- SUKSES KIRIM -->
    <div v-if="submitted" class="max-w-xl mx-auto card p-10 text-center">
      <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="font-display text-2xl font-extrabold text-white mb-2">Pengajuan terkirim!</h2>
      <p class="text-slate-400">
        Bukti transfermu sedang ditinjau admin. Membership aktif otomatis setelah disetujui.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/dashboard" class="btn-primary">Cek status di Dashboard</NuxtLink>
        <NuxtLink to="/kelas" class="btn-ghost">Lihat kelas</NuxtLink>
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

    <!-- SUDAH PUNYA PENGAJUAN MENUNGGU -->
    <div v-else-if="pendingMembership" class="max-w-xl mx-auto card p-8 text-center border-amber-400/30 bg-amber-400/[0.05]">
      <h2 class="font-display text-xl font-bold text-white mb-2">Pengajuan sedang ditinjau</h2>
      <p class="text-sm text-slate-400 mb-2">
        Kamu sudah mengirim bukti pembayaran paket
        <span class="text-white font-semibold">{{ pendingMembership.paket }}</span>
        sebesar <span class="text-brand-300 font-semibold">{{ rupiah(pendingMembership.nominal) }}</span>.
      </p>
      <p class="text-sm text-slate-400 mb-6">Tunggu konfirmasi admin — statusnya bisa kamu pantau di dashboard.</p>
      <NuxtLink to="/dashboard" class="btn-primary">Ke Dashboard</NuxtLink>
    </div>

    <!-- SUDAH PUNYA MEMBERSHIP AKTIF -->
    <div v-else-if="sudahAktif && membership" class="max-w-xl mx-auto card p-8 text-center border-brand-400/30 bg-brand-400/[0.05]">
      <h2 class="font-display text-xl font-bold text-white mb-2">Membership-mu sudah aktif</h2>
      <p class="text-sm text-slate-400 mb-6">
        Paket {{ membership.paket }} berlaku sampai {{ tanggalID(membership.berakhir) }}
        ({{ membership.sisaHari }} hari lagi).
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink to="/dashboard" class="btn-primary">Ke Dashboard</NuxtLink>
        <NuxtLink to="/keanggotaan/perpanjang" class="btn-ghost">Perpanjang</NuxtLink>
      </div>
    </div>

    <!-- PILIH PAKET + BAYAR -->
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
          <p class="font-display text-3xl font-extrabold text-white">{{ rupiah(p.harga) }}</p>
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

      <!-- PEMBAYARAN -->
      <div class="max-w-xl mx-auto card p-6 lg:p-8 space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-white">Pembayaran</h2>
          <span class="chip">Paket {{ paketDipilih.label }}</span>
        </div>

        <PaymentInfo :nominal="paketDipilih.harga" />

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Bukti transfer</label>
          <BuktiTransferUpload v-model="buktiTransfer" />
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">
            Catatan <span class="text-slate-600 normal-case tracking-normal">(opsional)</span>
          </label>
          <input v-model="catatan" maxlength="255" class="input" placeholder="mis. transfer a/n Budi Santoso">
        </div>

        <div
          v-if="errorMsg"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {{ errorMsg }}
        </div>

        <button :disabled="loading" class="btn-primary w-full" @click="ajukan">
          {{ loading ? 'Mengirim…' : `Kirim Bukti & Ajukan Paket ${paketDipilih.label}` }}
        </button>
      </div>
    </div>
  </section>
</template>
