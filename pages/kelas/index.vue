<script setup lang="ts">
useHead({ title: 'Kelas — Heyfit' })

interface Kelas {
  slug: string
  nama: string
  kategori: 'Mind & Body' | 'Cardio' | 'Strength' | 'Dance'
  instruktur: string
  jadwal: string
  durasi: string
  kuota: number
  terisi: number
  intensitas: 1 | 2 | 3
}

const kelas: Kelas[] = [
  { slug: 'yoga', nama: 'Yoga Flow', kategori: 'Mind & Body', instruktur: 'Sari Putri', jadwal: 'Sen & Rab · 18:00', durasi: '60 min', kuota: 15, terisi: 9, intensitas: 1 },
  { slug: 'pilates', nama: 'Reformer Pilates', kategori: 'Mind & Body', instruktur: 'Dini Anjani', jadwal: 'Sel & Kam · 19:00', durasi: '50 min', kuota: 12, terisi: 11, intensitas: 2 },
  { slug: 'hiit', nama: 'HIIT Burn', kategori: 'Cardio', instruktur: 'Bayu Pratama', jadwal: 'Jum · 17:30', durasi: '45 min', kuota: 20, terisi: 15, intensitas: 3 },
  { slug: 'zumba', nama: 'Zumba Party', kategori: 'Dance', instruktur: 'Mira Sanjaya', jadwal: 'Sab · 09:00', durasi: '60 min', kuota: 25, terisi: 18, intensitas: 2 },
  { slug: 'strength', nama: 'Functional Strength', kategori: 'Strength', instruktur: 'Reza Hakim', jadwal: 'Sen, Rab, Jum · 06:30', durasi: '55 min', kuota: 16, terisi: 7, intensitas: 3 },
  { slug: 'boxing', nama: 'Boxing Fundamentals', kategori: 'Cardio', instruktur: 'Coach Iwan', jadwal: 'Kam & Sab · 18:30', durasi: '60 min', kuota: 14, terisi: 14, intensitas: 3 },
]

const filterKat = ref<Kelas['kategori'] | 'Semua'>('Semua')
const kategoriList: (Kelas['kategori'] | 'Semua')[] = ['Semua', 'Mind & Body', 'Cardio', 'Strength', 'Dance']

const filtered = computed(() =>
  filterKat.value === 'Semua' ? kelas : kelas.filter(k => k.kategori === filterKat.value),
)

function bgFor(kategori: Kelas['kategori']) {
  const map: Record<Kelas['kategori'], string> = {
    'Mind & Body': 'from-emerald-500/30 via-brand-700/20 to-ink-900',
    'Cardio': 'from-rose-500/30 via-orange-700/20 to-ink-900',
    'Strength': 'from-sky-500/30 via-indigo-700/20 to-ink-900',
    'Dance': 'from-fuchsia-500/30 via-purple-700/20 to-ink-900',
  }
  return map[kategori]
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

    <!-- grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="k in filtered"
        :key="k.slug"
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
            <span class="font-medium">{{ k.durasi }}</span>
            <span :class="k.terisi >= k.kuota ? 'text-rose-300' : 'text-brand-300'">
              {{ k.terisi >= k.kuota ? 'Penuh' : `${k.kuota - k.terisi} slot tersisa` }}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col">
          <h3 class="font-display text-lg font-bold text-white">{{ k.nama }}</h3>
          <p class="text-xs text-slate-500 mt-0.5">w/ {{ k.instruktur }}</p>
          <p class="text-sm text-slate-400 mt-3">{{ k.jadwal }}</p>

          <div class="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full rounded-full"
              :class="k.terisi >= k.kuota ? 'bg-rose-400' : 'bg-brand-400'"
              :style="{ width: `${Math.min(100, (k.terisi / k.kuota) * 100)}%` }"
            />
          </div>

          <NuxtLink
            :to="`/kelas/${k.slug}/daftar`"
            :class="[
              'mt-5 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              k.terisi >= k.kuota
                ? 'border border-white/10 text-slate-500 cursor-not-allowed'
                : 'btn-primary',
            ]"
          >
            {{ k.terisi >= k.kuota ? 'Daftar waitlist' : 'Daftar kelas' }}
          </NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>
