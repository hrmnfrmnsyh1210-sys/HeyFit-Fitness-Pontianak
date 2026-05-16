<script setup lang="ts">
useHead({ title: 'Perpanjang Member — Heyfit' })

type Durasi = '1bulan' | '3bulan' | '12bulan'

const memberId = ref('')
const durasi = ref<Durasi>('3bulan')

const opsi: { id: Durasi, label: string, harga: number, perBulan: number, hemat?: string }[] = [
  { id: '1bulan', label: '1 Bulan', harga: 250_000, perBulan: 250_000 },
  { id: '3bulan', label: '3 Bulan', harga: 700_000, perBulan: 233_333, hemat: 'Hemat 7%' },
  { id: '12bulan', label: '12 Bulan', harga: 2_400_000, perBulan: 200_000, hemat: 'Hemat 20%' },
]

const selected = computed(() => opsi.find(o => o.id === durasi.value)!)
</script>

<template>
  <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-10">
      <p class="chip mb-3">Member Existing</p>
      <h1 class="font-display text-4xl font-extrabold text-white">
        Perpanjang <span class="text-gradient">tanpa antri</span>.
      </h1>
      <p class="mt-3 text-slate-400">Cukup 30 detik dari ponselmu.</p>
    </div>

    <div class="card p-6 lg:p-10">
      <div class="space-y-7">
        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">ID Member</label>
          <input v-model="memberId" placeholder="HF-XXXXX" class="input">
        </div>

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

        <button class="btn-primary w-full">
          Lanjut ke Pembayaran
          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
        </button>
        <p class="text-xs text-center text-slate-500">
          Pembayaran aman via VA, e-wallet, atau QRIS.
        </p>
      </div>
    </div>
  </section>
</template>
