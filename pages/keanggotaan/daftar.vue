<script setup lang="ts">
useHead({ title: 'Daftar Member — Heyfit' })

type Paket = 'bulanan' | '3bulan' | 'tahunan'

interface MemberForm {
  nama: string
  email: string
  telepon: string
  paket: Paket
}

const form = reactive<MemberForm>({
  nama: '',
  email: '',
  telepon: '',
  paket: 'bulanan',
})

const submitted = ref(false)
const loading = ref(false)

const paketList: { id: Paket, label: string, harga: string, highlight?: boolean, perks: string[] }[] = [
  {
    id: 'bulanan',
    label: 'Bulanan',
    harga: 'Rp 250rb',
    perks: ['Akses gym 24/7', '2 kelas/bulan', 'Locker harian'],
  },
  {
    id: '3bulan',
    label: '3 Bulan',
    harga: 'Rp 700rb',
    highlight: true,
    perks: ['Akses gym 24/7', '10 kelas/bulan', 'Locker pribadi', 'Free 1x personal training'],
  },
  {
    id: 'tahunan',
    label: 'Tahunan',
    harga: 'Rp 2.4jt',
    perks: ['Semua benefit 3 bulan', 'Unlimited kelas', 'Akses sauna', 'Free apparel pack'],
  },
]

function handleSubmit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    submitted.value = true
  }, 600)
}
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <p class="chip-accent mb-4">
        <span class="glow-dot" />
        7 hari trial gratis
      </p>
      <h1 class="font-display text-4xl sm:text-5xl font-extrabold text-white">
        Pilih paket. <span class="text-gradient">Mulai hari ini.</span>
      </h1>
      <p class="mt-4 text-slate-400">
        Tanpa biaya pendaftaran. Tanpa kontrak panjang. Batalkan kapan saja.
      </p>
    </div>

    <!-- pricing tiers -->
    <div v-if="!submitted" class="grid md:grid-cols-3 gap-4 mb-12">
      <button
        v-for="p in paketList"
        :key="p.id"
        type="button"
        :class="[
          'card-hover p-6 text-left flex flex-col',
          form.paket === p.id ? 'border-brand-400/60 bg-brand-400/[0.08] shadow-glow' : '',
          p.highlight && form.paket !== p.id ? 'border-white/15' : '',
        ]"
        @click="form.paket = p.id"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display text-lg font-bold text-white">{{ p.label }}</h3>
          <span v-if="p.highlight" class="chip-accent">Populer</span>
        </div>
        <p class="font-display text-3xl font-extrabold text-white">{{ p.harga }}</p>
        <ul class="mt-5 space-y-2 text-sm text-slate-400 flex-1">
          <li v-for="perk in p.perks" :key="perk" class="flex items-start gap-2">
            <svg class="w-4 h-4 text-brand-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd"/>
            </svg>
            {{ perk }}
          </li>
        </ul>
        <div class="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <span :class="form.paket === p.id ? 'glow-dot' : 'h-1.5 w-1.5 rounded-full bg-white/20'" />
          {{ form.paket === p.id ? 'Dipilih' : 'Klik untuk pilih' }}
        </div>
      </button>
    </div>

    <!-- form -->
    <div v-if="!submitted" class="grid lg:grid-cols-5 gap-6">
      <form class="lg:col-span-3 card p-6 lg:p-8 space-y-5" @submit.prevent="handleSubmit">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-display text-xl font-bold text-white">Data diri</h2>
          <span class="chip">Step 2 / 2</span>
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Nama lengkap</label>
          <input v-model="form.nama" required placeholder="Mis. Andi Saputra" class="input">
        </div>
        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email</label>
          <input v-model="form.email" type="email" required placeholder="kamu@email.com" class="input">
        </div>
        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">No. Telepon</label>
          <input v-model="form.telepon" required placeholder="081234567890" class="input">
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="!loading">Daftar &amp; Mulai Trial</span>
          <span v-else>Memproses…</span>
        </button>
        <p class="text-xs text-center text-slate-500">
          Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan Heyfit.
        </p>
      </form>

      <aside class="lg:col-span-2 card p-6 lg:p-8">
        <p class="chip mb-3">Ringkasan</p>
        <h3 class="font-display text-xl font-bold text-white mb-4">
          Paket {{ paketList.find(p => p.id === form.paket)?.label }}
        </h3>
        <div class="flex items-baseline justify-between py-3 border-b border-white/[0.06]">
          <span class="text-sm text-slate-400">Harga paket</span>
          <span class="font-display text-2xl font-extrabold text-white">
            {{ paketList.find(p => p.id === form.paket)?.harga }}
          </span>
        </div>
        <div class="flex items-baseline justify-between py-3 border-b border-white/[0.06]">
          <span class="text-sm text-slate-400">Biaya pendaftaran</span>
          <span class="font-semibold text-brand-300">GRATIS</span>
        </div>
        <div class="flex items-baseline justify-between py-3">
          <span class="text-sm text-slate-400">Trial</span>
          <span class="font-semibold text-white">7 hari</span>
        </div>

        <div class="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 text-xs text-slate-400">
          <p class="text-white font-semibold mb-1">💡 Tahukah kamu?</p>
          Member tahunan rata-rata berolahraga 3x lebih sering dibanding paket bulanan.
        </div>
      </aside>
    </div>

    <!-- success -->
    <div v-else class="max-w-xl mx-auto card p-10 text-center">
      <div class="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/20 text-brand-300 shadow-glow">
        <svg class="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd"/>
        </svg>
      </div>
      <h2 class="font-display text-2xl font-extrabold text-white mb-2">Selamat datang, {{ form.nama }}!</h2>
      <p class="text-slate-400">
        Trial 7 hari paket <span class="text-brand-300 font-semibold">{{ paketList.find(p => p.id === form.paket)?.label }}</span> sudah aktif.
        Kami akan menghubungi {{ form.telepon }} untuk konfirmasi.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/kelas" class="btn-primary">Booking kelas pertama</NuxtLink>
        <NuxtLink to="/" class="btn-ghost">Kembali ke beranda</NuxtLink>
      </div>
    </div>
  </section>
</template>
