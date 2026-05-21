<script setup lang="ts">
useHead({ title: 'Kelas — Heyfit' })

type Kategori = 'Mind & Body' | 'Cardio' | 'Strength' | 'Dance'

// Data kelas diambil langsung dari database (tabel classes + instructors).
const { data, pending } = await useFetch('/api/classes')
const kelas = computed(() => data.value?.data ?? [])

const filterKat = ref<Kategori | 'Semua'>('Semua')
const kategoriList: (Kategori | 'Semua')[] = ['Semua', 'Mind & Body', 'Cardio', 'Strength', 'Dance']

const filtered = computed(() =>
  filterKat.value === 'Semua'
    ? kelas.value
    : kelas.value.filter(k => k.kategori === filterKat.value),
)

function bgFor(kategori: string) {
  const map: Record<string, string> = {
    'Mind & Body': 'from-emerald-500/30 via-brand-700/20 to-ink-900',
    'Cardio': 'from-rose-500/30 via-orange-700/20 to-ink-900',
    'Strength': 'from-sky-500/30 via-indigo-700/20 to-ink-900',
    'Dance': 'from-fuchsia-500/30 via-purple-700/20 to-ink-900',
  }
  return map[kategori] ?? 'from-brand-500/30 via-brand-700/20 to-ink-900'
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <!-- hero header -->
    <div class="mb-10">
      <p class="chip-accent mb-3"><span class="glow-dot" />Schedule minggu ini</p>
      <h1 class="font-display text-4xl sm:text-5xl font-extrabold text-white">
        Kelas yang bikin <span class="text-gradient">ketagihan</span>.
      </h1>
      <p class="mt-3 text-slate-400 max-w-2xl">
        Dari yoga yang menenangkan sampai HIIT yang memacu adrenalin. Pilih, booking, datang.
      </p>
    </div>

    <!-- filter -->
    <div class="flex flex-wrap gap-2 mb-8">
      <button
        v-for="kat in kategoriList"
        :key="kat"
        type="button"
        :class="[
          'rounded-full px-4 py-1.5 text-sm font-medium transition border',
          filterKat === kat
            ? 'border-brand-400/60 bg-brand-400/15 text-brand-300'
            : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20',
        ]"
        @click="filterKat = kat"
      >
        {{ kat }}
      </button>
    </div>

    <!-- loading -->
    <div v-if="pending" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="card overflow-hidden">
        <div class="aspect-[5/3] bg-white/5 animate-pulse" />
        <div class="p-5 space-y-3">
          <div class="h-5 w-32 bg-white/10 rounded animate-pulse" />
          <div class="h-3 w-24 bg-white/10 rounded animate-pulse" />
          <div class="h-9 w-full bg-white/10 rounded-full animate-pulse mt-4" />
        </div>
      </div>
    </div>

    <!-- kosong -->
    <div v-else-if="!filtered.length" class="card p-12 text-center">
      <p class="font-display text-xl font-bold text-white mb-1">Belum ada kelas</p>
      <p class="text-slate-400 text-sm">
        Belum ada kelas pada kategori ini. Coba kategori lain atau cek lagi nanti.
      </p>
    </div>

    <!-- grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="k in filtered"
        :key="k.id"
        class="card-hover overflow-hidden flex flex-col group"
      >
        <div :class="['relative aspect-[5/3] bg-gradient-to-br overflow-hidden', bgFor(k.kategori)]">
          <div class="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" />
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />

          <div class="absolute top-3 left-3 chip">{{ k.kategori }}</div>
          <div class="absolute top-3 right-3 flex items-center gap-0.5">
            <span v-for="i in 3" :key="i" :class="['h-1.5 w-3 rounded-full', i <= k.intensitas ? 'bg-brand-400' : 'bg-white/15']" />
          </div>

          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
            <span class="font-medium">{{ k.durasiMenit }} min</span>
            <span :class="k.terisi >= k.kuota ? 'text-rose-300' : 'text-brand-300'">
              {{ k.terisi >= k.kuota ? 'Penuh' : `${k.kuota - k.terisi} slot tersisa` }}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-display text-lg font-bold text-white">{{ k.nama }}</h3>
          <p class="text-xs text-slate-500 mt-0.5">
            w/ {{ k.instrukturNama ?? 'Pelatih segera diumumkan' }}
            <span v-if="k.instrukturSpesialisasi" class="text-brand-400/80"> · {{ k.instrukturSpesialisasi }}</span>
          </p>
          <div class="mt-3 flex items-center justify-between gap-2">
            <p class="text-sm text-slate-400">{{ k.jadwal }}</p>
            <p class="text-sm font-bold text-brand-300 shrink-0">
              {{ k.harga > 0 ? rupiah(k.harga) : 'Gratis' }}
            </p>
          </div>

          <div class="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full rounded-full"
              :class="k.terisi >= k.kuota ? 'bg-rose-400' : 'bg-brand-400'"
              :style="{ width: `${Math.min(100, (k.terisi / k.kuota) * 100)}%` }"
            />
          </div>

          <NuxtLink
            :to="`/kelas/${k.id}/daftar`"
            :class="[
              'mt-5 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              k.terisi >= k.kuota
                ? 'border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                : 'btn-primary',
            ]"
          >
            {{ k.terisi >= k.kuota ? 'Lihat detail' : 'Daftar kelas' }}
          </NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>
