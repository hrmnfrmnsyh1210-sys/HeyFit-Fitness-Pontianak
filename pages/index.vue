<script setup lang="ts">
useHead({ title: 'Heyfit — Train Hard, Live Better' })

const stats = [
  { value: '5.000+', label: 'Member aktif' },
  { value: '24/7', label: 'Akses gym' },
  { value: '40+', label: 'Kelas/minggu' },
  { value: '12', label: 'Instruktur tersertifikasi' },
]

const features = [
  {
    title: 'Keanggotaan Fleksibel',
    desc: 'Paket bulanan, 3-bulanan, sampai tahunan. Cocok untuk pemula maupun atlet.',
    to: '/keanggotaan/daftar',
    cta: 'Daftar member',
    span: 'md:col-span-2',
    accent: true,
  },
  {
    title: 'Kelas Group & Personal',
    desc: 'Yoga, Pilates, HIIT, Zumba — booking dari aplikasi.',
    to: '/kelas',
    cta: 'Lihat jadwal',
    span: 'md:col-span-1',
  },
  {
    title: 'Fasilitas Lengkap',
    desc: 'Gym utama, studio, sauna, locker, juice bar.',
    to: '/fasilitas',
    cta: 'Eksplor fasilitas',
    span: 'md:col-span-1',
  },
  {
    title: 'Perpanjang dalam Hitungan Detik',
    desc: 'Renewal online tanpa antri di front desk.',
    to: '/keanggotaan/perpanjang',
    cta: 'Perpanjang sekarang',
    span: 'md:col-span-2',
  },
]

// Kelas populer diambil dari database — 3 kelas teratas.
const { data: kelasData } = await useFetch('/api/classes')
const featuredKelas = computed(() => (kelasData.value?.data ?? []).slice(0, 3))
</script>

<template>
  <!-- HERO -->
  <section class="relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div class="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div class="lg:col-span-7">
          <div class="chip-accent mb-5">
            <span class="glow-dot" />
            Now open · Heyfit Pontianak
          </div>
          <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-white">
            Train Hard.<br>
            <span class="text-gradient">Live Stronger.</span>
          </h1>
          <p class="mt-5 text-base sm:text-lg text-slate-400 max-w-xl">
            Heyfit adalah komunitas fitness modern dengan kelas, fasilitas premium,
            dan tim pelatih yang siap mengantar kamu ke versi terbaikmu.
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <NuxtLink to="/keanggotaan/daftar" class="btn-primary">
              Mulai 7 Hari Trial
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
            </NuxtLink>
            <NuxtLink to="/kelas" class="btn-ghost">
              Lihat kelas
            </NuxtLink>
          </div>

          <div class="mt-10 flex items-center gap-3 text-xs text-slate-500">
            <div class="flex -space-x-2">
              <div v-for="i in 4" :key="i" class="h-7 w-7 rounded-full border-2 border-ink-950 bg-gradient-to-br from-brand-400 to-brand-700" />
            </div>
            <p>Dipercaya <span class="text-slate-200 font-semibold">5.000+ member</span> di Pontianak</p>
          </div>
        </div>

        <!-- visual side -->
        <div class="lg:col-span-5 relative">
          <div class="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-ink-800 to-ink-950">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.4),transparent_55%)]" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(34,211,238,0.22),transparent_55%)]" />
            <div class="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay" />

            <!-- floating cards -->
            <div class="absolute top-6 left-6 card px-4 py-3 animate-float">
              <p class="text-[10px] uppercase tracking-widest text-slate-500">Heart rate</p>
              <p class="font-display text-2xl font-extrabold text-white">142 <span class="text-xs text-brand-400 font-sans font-medium">bpm</span></p>
            </div>

            <div class="absolute bottom-6 right-6 card px-4 py-3 animate-float" style="animation-delay: -3s">
              <p class="text-[10px] uppercase tracking-widest text-slate-500">Streak</p>
              <p class="font-display text-2xl font-extrabold text-white">14 <span class="text-xs text-brand-400 font-sans font-medium">hari</span></p>
            </div>

            <div class="absolute inset-x-6 bottom-24 card p-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xs uppercase tracking-widest text-slate-500">Hari ini</p>
                <span class="chip-accent">Live</span>
              </div>
              <p class="font-display text-lg font-bold text-white">HIIT Burn · 17:30</p>
              <div class="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div class="h-full w-3/4 rounded-full bg-brand-400" />
              </div>
              <p class="mt-2 text-xs text-slate-500">15 dari 20 slot terisi</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- stats bar -->
    <div class="border-y border-white/[0.06] bg-ink-900/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="s in stats" :key="s.label">
          <p class="font-display text-2xl md:text-3xl font-extrabold text-white">{{ s.value }}</p>
          <p class="text-xs uppercase tracking-widest text-slate-500 mt-1">{{ s.label }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES BENTO -->
  <section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="chip mb-3">Kenapa Heyfit</p>
          <h2 class="font-display text-3xl sm:text-4xl font-extrabold text-white max-w-xl">
            Semua yang kamu butuhkan untuk <span class="text-brand-400">konsisten</span>.
          </h2>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="f in features"
          :key="f.to"
          :to="f.to"
          :class="[f.span, f.accent ? 'border-brand-400/30 bg-brand-400/[0.06]' : '']"
          class="card-hover p-6 lg:p-8 flex flex-col group"
        >
          <h3 class="font-display text-xl lg:text-2xl font-bold text-white mb-2">{{ f.title }}</h3>
          <p class="text-sm text-slate-400 flex-1">{{ f.desc }}</p>
          <p class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 group-hover:gap-3 transition-all">
            {{ f.cta }}
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
          </p>
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- FEATURED KELAS -->
  <section v-if="featuredKelas.length" class="py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="chip mb-3">Kelas Populer</p>
          <h2 class="font-display text-3xl font-extrabold text-white">Booking sesi favoritmu</h2>
        </div>
        <NuxtLink to="/kelas" class="hidden sm:inline-flex btn-ghost">Semua kelas</NuxtLink>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          v-for="k in featuredKelas"
          :key="k.id"
          :to="`/kelas/${k.id}/daftar`"
          class="card-hover overflow-hidden group"
        >
          <div class="relative aspect-[5/3] bg-gradient-to-br from-brand-500/30 via-brand-700/20 to-ink-900 overflow-hidden">
            <div class="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,211,238,0.38),transparent_60%)]" />
            <span class="absolute top-3 left-3 chip-accent">{{ k.kategori }}</span>
          </div>
          <div class="p-5">
            <h3 class="font-display text-lg font-bold text-white">{{ k.nama }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">w/ {{ k.instrukturNama ?? 'Pelatih segera diumumkan' }}</p>
            <p class="mt-3 inline-flex items-center gap-1 text-sm text-brand-300 group-hover:gap-2 transition-all">
              Daftar kelas
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="py-20">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border border-brand-400/30 bg-gradient-to-br from-brand-400/10 via-ink-900 to-ink-950 p-10 lg:p-14">
        <div class="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div class="relative">
          <h2 class="font-display text-3xl lg:text-4xl font-extrabold text-white max-w-xl">
            Mulai perjalanan kebugaranmu hari ini.
          </h2>
          <p class="mt-3 text-slate-400 max-w-lg">
            Coba 7 hari trial. Tanpa biaya pendaftaran, batalkan kapan saja.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink to="/keanggotaan/daftar" class="btn-primary">Klaim trial gratis</NuxtLink>
            <NuxtLink to="/fasilitas" class="btn-ghost">Lihat fasilitas dulu</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
