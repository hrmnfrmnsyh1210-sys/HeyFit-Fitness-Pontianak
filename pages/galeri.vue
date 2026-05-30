<script setup lang="ts">
useHead({ title: 'Galeri & Berita — Heyfit' })

interface GalleryItem {
  id: number
  judul: string
  kategori: string
  ringkasan: string | null
  konten: string | null
  gambar: string
  createdAt: string
}

const { data, pending } = await useFetch<{ data: GalleryItem[] }>('/api/gallery', {
  query: { limit: 50 },
  default: () => ({ data: [] }),
})
const items = computed(() => data.value?.data ?? [])

// Filter kategori — dibangun dari data (kategori bebas teks).
const activeKategori = ref('Semua')
const kategoriList = computed(() => {
  const set = new Set<string>()
  for (const g of items.value) set.add(g.kategori)
  return ['Semua', ...Array.from(set)]
})
const filtered = computed(() =>
  activeKategori.value === 'Semua'
    ? items.value
    : items.value.filter(g => g.kategori === activeKategori.value),
)

// Modal baca berita.
const selected = ref<GalleryItem | null>(null)

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <!-- header -->
    <div class="mb-8">
      <p class="chip-accent mb-3"><span class="glow-dot" />Galeri &amp; Berita</p>
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-white">
        Kabar &amp; momen <span class="text-gradient">Heyfit</span>
      </h1>
      <p class="text-slate-400 mt-2 max-w-xl">
        Dokumentasi event, promo, dan berita terbaru seputar komunitas Heyfit Fitness.
      </p>
    </div>

    <!-- filter kategori -->
    <div v-if="!pending && items.length" class="flex flex-wrap gap-2 mb-8">
      <button
        v-for="k in kategoriList"
        :key="k"
        type="button"
        :class="[
          'rounded-full border px-4 py-1.5 text-sm font-medium transition',
          activeKategori === k
            ? 'border-brand-400/40 bg-brand-400/15 text-brand-200'
            : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20',
        ]"
        @click="activeKategori = k"
      >
        {{ k }}
      </button>
    </div>

    <!-- loading -->
    <div v-if="pending" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="card overflow-hidden">
        <div class="aspect-[16/10] bg-white/5 animate-pulse" />
        <div class="p-5 space-y-2">
          <div class="h-3 w-20 bg-white/10 rounded" />
          <div class="h-5 w-3/4 bg-white/10 rounded" />
        </div>
      </div>
    </div>

    <!-- kosong -->
    <div v-else-if="!items.length" class="card p-16 text-center">
      <p class="text-3xl mb-2">🖼️</p>
      <p class="text-white font-semibold">Belum ada berita</p>
      <p class="text-slate-500 text-sm mt-1">Galeri akan terisi seiring kegiatan Heyfit berlangsung.</p>
    </div>

    <!-- grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="g in filtered"
        :key="g.id"
        type="button"
        class="card-hover overflow-hidden group text-left flex flex-col"
        @click="selected = g"
      >
        <div class="relative aspect-[16/10] bg-black/40 overflow-hidden">
          <img
            :src="g.gambar"
            :alt="g.judul"
            class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          >
          <span class="absolute top-3 left-3 chip-accent">{{ g.kategori }}</span>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <p class="text-[11px] text-slate-500">{{ formatTanggal(g.createdAt) }}</p>
          <h3 class="font-display text-lg font-bold text-white mt-1 line-clamp-2">{{ g.judul }}</h3>
          <p class="text-sm text-slate-400 mt-2 line-clamp-3 flex-1">
            {{ g.ringkasan || g.konten || '' }}
          </p>
          <p class="mt-4 inline-flex items-center gap-1 text-sm text-brand-300 group-hover:gap-2 transition-all">
            Baca selengkapnya
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
          </p>
        </div>
      </button>
    </div>

    <!-- MODAL BACA BERITA -->
    <Teleport to="body">
      <div v-if="selected" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" @click="selected = null" />
        <div class="relative w-full max-w-2xl card overflow-hidden max-h-[90vh] flex flex-col">
          <div class="relative shrink-0">
            <img :src="selected.gambar" :alt="selected.judul" class="w-full max-h-[45vh] object-cover">
            <button
              type="button"
              class="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-ink-950/70 backdrop-blur text-slate-200 hover:text-white transition"
              @click="selected = null"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span class="absolute bottom-3 left-3 chip-accent">{{ selected.kategori }}</span>
          </div>
          <div class="p-6 overflow-y-auto">
            <p class="text-[11px] text-slate-500">{{ formatTanggal(selected.createdAt) }}</p>
            <h3 class="font-display text-2xl font-extrabold text-white mt-1">{{ selected.judul }}</h3>
            <p v-if="selected.ringkasan" class="text-slate-300 mt-3">{{ selected.ringkasan }}</p>
            <p v-if="selected.konten" class="text-slate-400 mt-3 whitespace-pre-line leading-relaxed">{{ selected.konten }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
