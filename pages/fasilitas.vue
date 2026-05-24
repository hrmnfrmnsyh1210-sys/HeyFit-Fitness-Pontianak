<script setup lang="ts">
useHead({ title: 'Fasilitas — Heyfit' })

interface Fasilitas {
  nama: string
  deskripsi: string
  icon: string
  img: string
  span?: string
  highlight?: boolean
}

// Placeholder Picsum (random tapi konsisten per seed). Ganti URL di field `img`
// dengan foto fasilitas asli kapan saja — selebihnya layout tetap.
const fasilitas: Fasilitas[] = [
  {
    nama: 'Ruang Gym Utama',
    deskripsi: 'Free weight lengkap, cable machine premium, treadmill & area cardio luas dengan view kota.',
    icon: 'dumbbell',
    img: 'https://picsum.photos/seed/heyfit-gym/1200/900',
    span: 'md:col-span-2 md:row-span-2',
    highlight: true,
  },
  {
    nama: 'Studio Yoga & Pilates',
    deskripsi: 'Studio AC + reformer, matras Manduka, dan sound system imersif.',
    icon: 'lotus',
    img: 'https://picsum.photos/seed/heyfit-yoga/1000/600',
    span: 'md:col-span-2',
  },
  {
    nama: 'Locker Room',
    deskripsi: 'Loker pribadi & shower air panas/dingin 24 jam.',
    icon: 'lock',
    img: 'https://picsum.photos/seed/heyfit-locker/800/600',
  },
  {
    nama: 'Sauna',
    deskripsi: 'Recovery untuk member paket tahunan.',
    icon: 'flame',
    img: 'https://picsum.photos/seed/heyfit-sauna/800/600',
  },
  {
    nama: 'Juice Bar',
    deskripsi: 'Protein shake, smoothie, dan kopi spesialti.',
    icon: 'glass',
    img: 'https://picsum.photos/seed/heyfit-juice/1000/600',
    span: 'md:col-span-2',
  },
  {
    nama: 'Parkir Luas',
    deskripsi: 'Parkir motor & mobil gratis tanpa batas waktu untuk member.',
    icon: 'car',
    img: 'https://picsum.photos/seed/heyfit-parking/1000/600',
    span: 'md:col-span-2',
  },
]
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <div class="mb-10">
      <p class="chip mb-3">Fasilitas Premium</p>
      <h1 class="font-display text-4xl sm:text-5xl font-extrabold text-white">
        Semua yang kamu butuhkan, <span class="text-gradient">dalam satu tempat</span>.
      </h1>
      <p class="mt-3 text-slate-400 max-w-2xl">
        Dirancang oleh atlet & arsitek untuk pengalaman fitness yang tidak biasa-biasa saja.
      </p>
    </div>

    <div class="grid md:grid-cols-4 md:auto-rows-[200px] gap-4">
      <div
        v-for="f in fasilitas"
        :key="f.nama"
        :class="[
          'card-hover group p-0 flex flex-col justify-between overflow-hidden relative isolate',
          f.span ?? '',
          f.highlight ? 'border-brand-400/30' : '',
        ]"
      >
        <!-- background image -->
        <img
          :src="f.img"
          :alt="f.nama"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 -z-10"
        >
        <!-- gradient overlay biar teks tetap kebaca -->
        <div class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30 -z-10" />
        <!-- aksen warna khas brand di kartu highlight -->
        <div
          v-if="f.highlight"
          class="absolute inset-0 bg-gradient-to-br from-brand-500/25 via-transparent to-transparent mix-blend-overlay pointer-events-none -z-10"
        />

        <!-- top row: icon + label -->
        <div class="p-5 flex items-start justify-between">
          <div class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-ink-950/60 backdrop-blur text-brand-300">
            <!-- dumbbell -->
            <svg v-if="f.icon === 'dumbbell'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M3 7v10M18 4v16M21 7v10M6 12h12"/></svg>
            <!-- lotus -->
            <svg v-else-if="f.icon === 'lotus'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4 0-8-2-9-6 2-1 5-1 7 1M12 21c4 0 8-2 9-6-2-1-5-1-7 1M12 21V9M12 9c-3-2-4-5-3-8 3 0 5 3 5 6M12 9c3-2 4-5 3-8-3 0-5 3-5 6"/></svg>
            <!-- lock -->
            <svg v-else-if="f.icon === 'lock'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
            <!-- flame -->
            <svg v-else-if="f.icon === 'flame'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 5 4 9a4 4 0 0 1-8 0c0-2 2-3 2-5 2 1 2 3 2 3s-1-3 0-7z"/><path d="M7 14c0 4 2 7 5 7s5-3 5-7"/></svg>
            <!-- glass -->
            <svg v-else-if="f.icon === 'glass'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-1 9a5 5 0 0 1-10 0L6 3zM12 17v4M8 21h8"/></svg>
            <!-- car -->
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17v3M19 17v3M3 17l2-6h14l2 6"/><circle cx="7" cy="14" r="1"/><circle cx="17" cy="14" r="1"/></svg>
          </div>
          <span v-if="f.highlight" class="chip-accent">
            <span class="glow-dot" />
            Unggulan
          </span>
        </div>

        <!-- bottom text -->
        <div class="p-5 pt-3">
          <h3 class="font-display text-lg lg:text-xl font-bold text-white drop-shadow">{{ f.nama }}</h3>
          <p class="mt-1.5 text-sm text-slate-300/90">{{ f.deskripsi }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
