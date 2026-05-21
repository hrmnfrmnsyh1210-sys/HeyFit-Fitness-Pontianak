<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Perpanjang Member — Heyfit' })

const { data, refresh } = await useFetch('/api/member/overview')

type Durasi = 'bulanan' | '3bulan' | 'tahunan'

const opsi = [
  { id: 'bulanan', label: '1 Bulan', harga: 250_000, perBulan: 250_000, hemat: '' },
  { id: '3bulan', label: '3 Bulan', harga: 700_000, perBulan: 233_333, hemat: 'Hemat 7%' },
  { id: 'tahunan', label: '12 Bulan', harga: 2_400_000, perBulan: 200_000, hemat: 'Hemat 20%' },
] as const

const durasi = ref<Durasi>('3bulan')
const selected = computed(() => opsi.find(o => o.id === durasi.value)!)
const membership = computed(() => data.value?.membership ?? null)

const paketLabel: Record<string, string> = {
  bulanan: 'Bulanan', '3bulan': '3 Bulan', tahunan: 'Tahunan',
}

function formatTanggal(str: string) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const loading = ref(false)
const errorMsg = ref('')
const result = ref<{ berakhir: string, sisaHari: number, diperpanjang: boolean } | null>(null)

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await $fetch('/api/member/membership', {
      method: 'POST',
      body: { paket: durasi.value },
    })
    result.value = res.membership
    await refresh()
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
      <p class="mt-3 text-slate-400">Cukup 30 detik dari ponselmu.</p>
    </div>

    <!-- sukses -->
    <div v-if="result" class="card p-10 text-center">
      <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/20 text-brand-300 shadow-glow">
        <svg class="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <h2 class="font-display text-2xl font-extrabold text-white mb-2">
        {{ result.diperpanjang ? 'Membership diperpanjang!' : 'Membership aktif!' }}
      </h2>
      <p class="text-slate-400">
        Berlaku sampai <span class="text-brand-300 font-semibold">{{ formatTanggal(result.berakhir) }}</span>
        ({{ result.sisaHari }} hari lagi).
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/dashboard" class="btn-primary">Ke Dashboard</NuxtLink>
        <NuxtLink to="/kelas" class="btn-ghost">Booking kelas</NuxtLink>
      </div>
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
          Paket {{ paketLabel[membership.paket] }} · aktif sampai {{ formatTanggal(membership.berakhir) }}
          <span class="text-brand-300">({{ membership.sisaHari }} hari lagi)</span>
        </p>
        <p v-else-if="membership" class="text-rose-300 font-semibold">
          Kadaluarsa sejak {{ formatTanggal(membership.berakhir) }}
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
              <p class="mt-1 font-display text-2xl font-extrabold text-white">
                Rp {{ o.harga.toLocaleString('id-ID') }}
              </p>
              <p class="text-xs text-slate-500 mt-1">≈ Rp {{ o.perBulan.toLocaleString('id-ID') }}/bln</p>
              <span v-if="o.hemat" class="absolute top-3 right-3 chip-accent">{{ o.hemat }}</span>
            </button>
          </div>
        </div>

        <div class="rounded-2xl bg-ink-800/60 border border-white/[0.06] p-5">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-400">Subtotal</span>
            <span class="font-display text-xl font-bold text-white">Rp {{ selected.harga.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-400">Service fee</span>
            <span class="text-sm text-brand-300 font-semibold">GRATIS</span>
          </div>
          <div class="border-t border-white/[0.08] mt-3 pt-3 flex items-center justify-between">
            <span class="font-semibold text-white">Total</span>
            <span class="font-display text-2xl font-extrabold text-brand-400">
              Rp {{ selected.harga.toLocaleString('id-ID') }}
            </span>
          </div>
        </div>

        <div
          v-if="errorMsg"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {{ errorMsg }}
        </div>

        <button :disabled="loading" class="btn-primary w-full" @click="submit">
          <span v-if="!loading">Konfirmasi Perpanjangan</span>
          <span v-else>Memproses…</span>
        </button>
        <p class="text-xs text-center text-slate-500">
          Demo — pembayaran belum terhubung. Membership langsung diperbarui.
        </p>
      </div>
    </div>
  </section>
</template>
