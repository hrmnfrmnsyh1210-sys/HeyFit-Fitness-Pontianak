<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Perpanjang Member — Heyfit' })

const { data } = await useFetch('/api/member/overview')
const { data: paymentsData, refresh: refreshPayments } = await useFetch('/api/member/payments', {
  default: () => ({ data: [] }),
})

type Durasi = 'bulanan' | '3bulan' | 'tahunan'

const opsi = [
  { id: 'bulanan', label: '1 Bulan', harga: 250_000, perBulan: 250_000, hemat: '' },
  { id: '3bulan', label: '3 Bulan', harga: 700_000, perBulan: 233_333, hemat: 'Hemat 7%' },
  { id: 'tahunan', label: '12 Bulan', harga: 2_400_000, perBulan: 200_000, hemat: 'Hemat 20%' },
] as const

const durasi = ref<Durasi>('3bulan')
const selected = computed(() => opsi.find(o => o.id === durasi.value)!)
const membership = computed(() => data.value?.membership ?? null)
const pendingMembership = computed(() =>
  (paymentsData.value?.data ?? []).find(p => p.jenis === 'membership' && p.status === 'menunggu') ?? null,
)

const paketLabel: Record<string, string> = {
  bulanan: 'Bulanan', '3bulan': '3 Bulan', tahunan: 'Tahunan',
}

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
        paket: durasi.value,
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
    errorMsg.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal memproses. Coba lagi.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div class="text-center mb-8">
      <p class="chip mb-3">Member Existing</p>
      <h1 class="font-display text-4xl font-extrabold text-white">
        Perpanjang <span class="text-gradient">membership</span>
      </h1>
      <p class="mt-3 text-slate-400">Transfer, unggah bukti, tunggu konfirmasi admin.</p>
    </div>

    <!-- sukses kirim -->
    <div v-if="submitted" class="card p-10 text-center">
      <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="font-display text-2xl font-extrabold text-white mb-2">Pengajuan terkirim!</h2>
      <p class="text-slate-400">
        Bukti transfermu sedang ditinjau admin. Membership diperpanjang otomatis setelah disetujui.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/dashboard" class="btn-primary">Cek status di Dashboard</NuxtLink>
        <NuxtLink to="/kelas" class="btn-ghost">Booking kelas</NuxtLink>
      </div>
    </div>

    <!-- sudah ada pengajuan menunggu -->
    <div v-else-if="pendingMembership" class="card p-8 text-center border-amber-400/30 bg-amber-400/[0.05]">
      <h2 class="font-display text-xl font-bold text-white mb-2">Pengajuan sedang ditinjau</h2>
      <p class="text-sm text-slate-400 mb-6">
        Kamu sudah mengirim bukti pembayaran paket
        <span class="text-white font-semibold">{{ pendingMembership.paket }}</span>
        sebesar <span class="text-brand-300 font-semibold">{{ rupiah(pendingMembership.nominal) }}</span>.
        Tunggu konfirmasi admin.
      </p>
      <NuxtLink to="/dashboard" class="btn-primary">Ke Dashboard</NuxtLink>
    </div>

    <!-- form -->
    <div v-else class="card p-6 lg:p-10">
      <!-- status saat ini -->
      <div
        class="mb-7 rounded-xl border p-4"
        :class="membership && membership.aktif
          ? 'border-brand-400/30 bg-brand-400/[0.06]'
          : 'border-white/10 bg-white/[0.02]'"
      >
        <p class="text-xs uppercase tracking-widest text-slate-500 mb-1">Status sekarang</p>
        <p v-if="membership && membership.aktif" class="text-white font-semibold">
          Paket {{ paketLabel[membership.paket] }} · aktif sampai {{ tanggalID(membership.berakhir) }}
          <span class="text-brand-300">({{ membership.sisaHari }} hari lagi)</span>
        </p>
        <p v-else-if="membership" class="text-rose-300 font-semibold">
          Kadaluarsa sejak {{ tanggalID(membership.berakhir) }}
        </p>
        <p v-else class="text-slate-400">
          Belum ada membership — perpanjangan ini akan menjadi aktivasi pertamamu.
        </p>
      </div>

      <div class="space-y-7">
        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-3">Pilih durasi</label>
          <div class="grid sm:grid-cols-3 gap-3">
            <button
              v-for="o in opsi"
              :key="o.id"
              type="button"
              :class="[
                'relative card-hover p-5 text-left',
                durasi === o.id ? 'border-brand-400/60 bg-brand-400/[0.08] shadow-glow' : '',
              ]"
              @click="durasi = o.id"
            >
              <p class="font-display text-lg font-bold text-white">{{ o.label }}</p>
              <p class="mt-1 font-display text-2xl font-extrabold text-white">{{ rupiah(o.harga) }}</p>
              <p class="text-xs text-slate-500 mt-1">≈ {{ rupiah(o.perBulan) }}/bln</p>
              <span v-if="o.hemat" class="absolute top-3 right-3 chip-accent">{{ o.hemat }}</span>
            </button>
          </div>
        </div>

        <PaymentInfo :nominal="selected.harga" />

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
          {{ loading ? 'Mengirim…' : 'Kirim Bukti & Ajukan Perpanjangan' }}
        </button>
      </div>
    </div>
  </section>
</template>
