<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const namaKelas = computed(() => slug.value.charAt(0).toUpperCase() + slug.value.slice(1))

useHead(() => ({ title: `Daftar ${namaKelas.value} — Heyfit` }))

const nama = ref('')
const memberId = ref('')
const sesi = ref('next')
const submitted = ref(false)
const loading = ref(false)

const sesiList = [
  { id: 'today', label: 'Hari ini · 17:30', slot: '3 slot' },
  { id: 'next', label: 'Besok · 18:00', slot: '8 slot' },
  { id: 'week', label: 'Minggu ini · 09:00', slot: '12 slot' },
]

function handleSubmit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    submitted.value = true
  }, 500)
}
</script>

<template>
  <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <NuxtLink to="/kelas" class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      Kembali ke kelas
    </NuxtLink>

    <div v-if="!submitted">
      <p class="chip mb-3">Pendaftaran Kelas</p>
      <h1 class="font-display text-4xl font-extrabold text-white">
        Reservasi <span class="text-gradient">{{ namaKelas }}</span>
      </h1>
      <p class="mt-3 text-slate-400">
        Pilih sesi dan isi data. Konfirmasi langsung muncul setelah submit.
      </p>

      <form class="mt-8 card p-6 lg:p-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-3">Pilih sesi</label>
          <div class="space-y-2">
            <label
              v-for="s in sesiList"
              :key="s.id"
              :class="[
                'flex items-center justify-between rounded-xl border p-4 cursor-pointer transition',
                sesi === s.id ? 'border-brand-400/60 bg-brand-400/[0.08]' : 'border-white/10 hover:border-white/20',
              ]"
            >
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'h-4 w-4 rounded-full border-2',
                    sesi === s.id ? 'border-brand-400 bg-brand-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)]' : 'border-white/30',
                  ]"
                />
                <span class="font-medium text-white">{{ s.label }}</span>
              </div>
              <span class="text-xs text-slate-400">{{ s.slot }}</span>
              <input v-model="sesi" type="radio" :value="s.id" class="hidden">
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Nama</label>
          <input v-model="nama" required class="input">
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">
            ID Member <span class="text-slate-600 normal-case tracking-normal">(opsional)</span>
          </label>
          <input v-model="memberId" placeholder="HF-XXXXX" class="input">
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="!loading">Konfirmasi Reservasi</span>
          <span v-else>Memproses…</span>
        </button>
      </form>
    </div>

    <div v-else class="card p-10 text-center">
      <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/20 text-brand-300 shadow-glow">
        <svg class="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd"/>
        </svg>
      </div>
      <h2 class="font-display text-2xl font-extrabold text-white mb-2">Reservasi berhasil!</h2>
      <p class="text-slate-400">
        Slot kelas <span class="text-brand-300 font-semibold">{{ namaKelas }}</span> sudah dipesan atas nama {{ nama }}.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/kelas" class="btn-primary">Booking kelas lain</NuxtLink>
        <NuxtLink to="/" class="btn-ghost">Beranda</NuxtLink>
      </div>
    </div>
  </section>
</template>
