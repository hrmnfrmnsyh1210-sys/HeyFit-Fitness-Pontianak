<script setup lang="ts">
/** Kartu info pembayaran — rekening resmi Heyfit Pontianak. */
defineProps<{ nominal?: number }>()

const rekening = [
  { bank: 'BCA', atasNama: 'PT BUGAR BERSAMA FITNESS', nomor: '646 566 6688' },
  { bank: 'BCA', atasNama: 'HARSONO HALIM', nomor: '347 036 9573' },
]

const copied = ref('')
async function salin(nomor: string) {
  try {
    await navigator.clipboard.writeText(nomor.replace(/\s/g, ''))
    copied.value = nomor
    setTimeout(() => { if (copied.value === nomor) copied.value = '' }, 2000)
  }
  catch {
    // clipboard tidak tersedia — abaikan
  }
}
</script>

<template>
  <div class="rounded-2xl border border-brand-400/25 bg-gradient-to-b from-brand-950/60 to-ink-900/40 overflow-hidden">
    <div class="bg-brand-400/10 border-b border-brand-400/15 px-5 py-3 text-center">
      <p class="font-display text-sm font-extrabold tracking-wide text-white uppercase">
        Pembayaran via Transfer Bank
      </p>
      <p class="text-[11px] text-brand-200/80 mt-0.5">Rekening Resmi Heyfit Pontianak</p>
    </div>

    <div class="p-5 space-y-3">
      <div v-if="nominal != null" class="rounded-xl border border-brand-400/30 bg-brand-400/[0.07] px-4 py-3 text-center">
        <p class="text-[10px] uppercase tracking-widest text-slate-400">Total yang harus ditransfer</p>
        <p class="font-display text-2xl font-extrabold text-brand-300">{{ rupiah(nominal) }}</p>
      </div>

      <div class="grid sm:grid-cols-2 gap-3">
        <div
          v-for="r in rekening"
          :key="r.nomor"
          class="rounded-xl border border-white/10 bg-ink-950/60 p-4"
        >
          <div class="flex items-center justify-between">
            <span class="chip">REK {{ r.bank }}</span>
            <button
              type="button"
              class="text-[11px] font-semibold text-brand-300 hover:text-brand-200 transition"
              @click="salin(r.nomor)"
            >
              {{ copied === r.nomor ? '✓ Tersalin' : 'Salin' }}
            </button>
          </div>
          <p class="mt-2 text-[10px] uppercase tracking-widest text-slate-500">Atas nama</p>
          <p class="text-sm font-semibold text-white leading-tight">{{ r.atasNama }}</p>
          <p class="mt-1 font-display text-lg font-extrabold tracking-wide text-brand-300">{{ r.nomor }}</p>
        </div>
      </div>

      <p class="text-[11px] leading-relaxed text-slate-500">
        ⚠️ Pembayaran di luar rekening Heyfit Pontianak <span class="text-slate-300 font-semibold">bukan tanggung
        jawab management</span>. Silakan melapor jika menemukan kejanggalan. Setelah transfer, unggah bukti
        di bawah lalu tunggu konfirmasi admin.
      </p>
    </div>
  </div>
</template>
