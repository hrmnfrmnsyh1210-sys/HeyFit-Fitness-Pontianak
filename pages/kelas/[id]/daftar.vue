<script setup lang="ts">
// Booking kelas wajib login — middleware mengarahkan ke /login kalau belum.
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => Number(route.params.id))

const { data, pending, error, refresh } = await useFetch(() => `/api/classes/${id.value}`)
const kelas = computed(() => data.value?.data ?? null)

useHead(() => ({
  title: kelas.value ? `Booking ${kelas.value.nama} — Heyfit` : 'Booking Kelas — Heyfit',
}))

const intensitasLabel = ['', 'Ringan', 'Menengah', 'Berat']

const slotTersisa = computed(() =>
  kelas.value ? Math.max(0, kelas.value.kuota - kelas.value.terisi) : 0,
)
const penuh = computed(() => !!kelas.value && slotTersisa.value <= 0)
const terisiPersen = computed(() =>
  kelas.value ? Math.min(100, Math.round((kelas.value.terisi / kelas.value.kuota) * 100)) : 0,
)
const gratis = computed(() => !!kelas.value && kelas.value.harga <= 0)

// form pembayaran
const buktiTransfer = ref('')
const catatan = ref('')
const loading = ref(false)
const actionError = ref('')
const justSubmitted = ref(false)

async function ajukan() {
  actionError.value = ''
  if (!gratis.value && !buktiTransfer.value) {
    actionError.value = 'Unggah bukti transfer terlebih dahulu.'
    return
  }
  loading.value = true
  try {
    await $fetch(`/api/classes/${id.value}/book`, {
      method: 'POST',
      body: gratis.value
        ? {}
        : { buktiTransfer: buktiTransfer.value, catatan: catatan.value },
    })
    justSubmitted.value = true
    buktiTransfer.value = ''
    catatan.value = ''
    await refresh()
  }
  catch (err) {
    actionError.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal memproses. Coba lagi.'
  }
  finally {
    loading.value = false
  }
}

async function batalkan() {
  actionError.value = ''
  loading.value = true
  try {
    await $fetch(`/api/classes/${id.value}/book`, { method: 'DELETE' })
    justSubmitted.value = false
    await refresh()
  }
  catch (err) {
    actionError.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal membatalkan. Coba lagi.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
    <NuxtLink to="/kelas" class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300 mb-6">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Kembali ke kelas
    </NuxtLink>

    <!-- loading -->
    <div v-if="pending" class="card p-8 animate-pulse">
      <div class="h-4 w-28 bg-white/10 rounded mb-4" />
      <div class="h-9 w-64 bg-white/10 rounded mb-6" />
      <div class="h-24 bg-white/10 rounded" />
    </div>

    <!-- tidak ditemukan -->
    <div v-else-if="error || !kelas" class="card p-10 text-center">
      <h1 class="font-display text-2xl font-extrabold text-white mb-2">Kelas tidak ditemukan</h1>
      <p class="text-slate-400 mb-6">Kelas yang kamu cari tidak tersedia atau sudah tidak aktif.</p>
      <NuxtLink to="/kelas" class="btn-primary">Lihat semua kelas</NuxtLink>
    </div>

    <!-- detail + booking -->
    <div v-else-if="kelas">
      <p class="chip mb-3">Pendaftaran Kelas</p>
      <h1 class="font-display text-4xl font-extrabold text-white">
        Reservasi <span class="text-gradient">{{ kelas.nama }}</span>
      </h1>
      <p class="mt-3 text-slate-400">
        Periksa detail kelas, lakukan pembayaran, lalu unggah bukti transfer untuk dikonfirmasi admin.
      </p>

      <div class="mt-8 card p-6 lg:p-8 space-y-6">
        <!-- kategori & intensitas -->
        <div class="flex items-center justify-between">
          <span class="chip">{{ kelas.kategori }}</span>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>Intensitas {{ intensitasLabel[kelas.intensitas] }}</span>
            <span class="flex items-center gap-0.5">
              <span
                v-for="i in 3"
                :key="i"
                :class="['h-1.5 w-3 rounded-full', i <= kelas.intensitas ? 'bg-brand-400' : 'bg-white/15']"
              />
            </span>
          </div>
        </div>

        <!-- personal trainer -->
        <div class="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-display text-lg font-extrabold shrink-0">
            {{ (kelas.instrukturNama ?? '?').charAt(0).toUpperCase() }}
          </span>
          <div class="min-w-0">
            <p class="text-[10px] uppercase tracking-widest text-slate-500">Personal Trainer</p>
            <p class="text-white font-semibold truncate">{{ kelas.instrukturNama ?? 'Pelatih segera diumumkan' }}</p>
            <p v-if="kelas.instrukturSpesialisasi" class="text-xs text-brand-300 truncate">{{ kelas.instrukturSpesialisasi }}</p>
          </div>
        </div>
        <p v-if="kelas.instrukturBio" class="-mt-2 text-sm text-slate-400">{{ kelas.instrukturBio }}</p>

        <!-- info grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="rounded-xl border border-white/[0.06] p-4">
            <p class="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Jadwal</p>
            <p class="text-sm text-white font-medium">{{ kelas.jadwal }}</p>
          </div>
          <div class="rounded-xl border border-white/[0.06] p-4">
            <p class="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Durasi</p>
            <p class="text-sm text-white font-medium">{{ kelas.durasiMenit }} menit</p>
          </div>
          <div class="rounded-xl border border-white/[0.06] p-4">
            <p class="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Slot</p>
            <p class="text-sm font-medium" :class="penuh ? 'text-rose-300' : 'text-brand-300'">
              {{ penuh ? 'Penuh' : `${slotTersisa} tersisa` }}
            </p>
          </div>
          <div class="rounded-xl border border-brand-400/20 bg-brand-400/[0.06] p-4">
            <p class="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Biaya</p>
            <p class="text-sm font-bold text-brand-300">{{ gratis ? 'Gratis' : rupiah(kelas.harga) }}</p>
          </div>
        </div>

        <!-- info masa berlaku booking -->
        <div
          v-if="kelas.masaBerlakuHari > 0"
          class="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-slate-400"
        >
          <svg class="w-4 h-4 mt-0.5 shrink-0 text-brand-300" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            Booking ini berlaku <span class="text-white font-semibold">{{ kelas.masaBerlakuHari }} hari</span>
            setelah dikonfirmasi. Setelah masa berlaku habis, kamu perlu booking &amp; bayar ulang untuk lanjut ikut kelas ini.
          </p>
        </div>

        <!-- progress slot -->
        <div>
          <div class="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{{ kelas.terisi }} terisi</span>
            <span>kuota {{ kelas.kuota }}</span>
          </div>
          <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full rounded-full"
              :class="penuh ? 'bg-rose-400' : 'bg-brand-400'"
              :style="{ width: `${terisiPersen}%` }"
            />
          </div>
        </div>

        <!-- error aksi -->
        <div
          v-if="actionError"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {{ actionError }}
        </div>

        <!-- ====== AKSI ====== -->
        <!-- sudah terdaftar (dikonfirmasi) -->
        <div
          v-if="kelas.bookingStatus === 'terdaftar'"
          class="rounded-xl border border-brand-400/30 bg-brand-400/[0.08] p-5"
        >
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-400/20 text-brand-300 shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z" clip-rule="evenodd" />
              </svg>
            </span>
            <div>
              <p class="text-white font-semibold">Kamu sudah terdaftar</p>
              <p class="text-sm text-slate-400">Pembayaranmu sudah dikonfirmasi admin. Sampai jumpa di kelas!</p>
              <p v-if="kelas.berlakuSampai" class="text-xs text-brand-300 mt-1">
                Berlaku sampai {{ tanggalID(kelas.berlakuSampai) }}.
              </p>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-3">
            <NuxtLink to="/dashboard" class="btn-primary">Lihat di dashboard</NuxtLink>
            <NuxtLink to="/kelas" class="btn-ghost">Booking kelas lain</NuxtLink>
          </div>
        </div>

        <!-- menunggu konfirmasi -->
        <div
          v-else-if="kelas.bookingStatus === 'menunggu'"
          class="rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-5"
        >
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <p class="text-white font-semibold">
                {{ justSubmitted ? 'Pengajuan terkirim!' : 'Menunggu konfirmasi admin' }}
              </p>
              <p class="text-sm text-slate-400">
                Bukti transfermu sedang ditinjau admin. Kamu akan resmi terdaftar setelah disetujui.
              </p>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap gap-3">
            <NuxtLink to="/dashboard" class="btn-primary">Cek status di dashboard</NuxtLink>
            <button
              type="button"
              :disabled="loading"
              class="btn border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              @click="batalkan"
            >
              {{ loading ? 'Memproses…' : 'Batalkan pengajuan' }}
            </button>
          </div>
        </div>

        <!-- penuh -->
        <button
          v-else-if="penuh"
          type="button"
          disabled
          class="btn w-full border border-white/10 text-slate-500 cursor-not-allowed"
        >
          Kuota kelas sudah penuh
        </button>

        <!-- kelas gratis -->
        <button
          v-else-if="gratis"
          type="button"
          :disabled="loading"
          class="btn-primary w-full"
          @click="ajukan"
        >
          {{ loading ? 'Memproses…' : 'Booking kelas (gratis)' }}
        </button>

        <!-- form pembayaran -->
        <div v-else class="space-y-5 border-t border-white/[0.06] pt-6">
          <h2 class="font-display text-lg font-bold text-white">Pembayaran</h2>

          <PaymentInfo :nominal="kelas.harga" />

          <!-- bukti -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Bukti transfer</label>
            <BuktiTransferUpload v-model="buktiTransfer" />
          </div>

          <!-- catatan -->
          <div>
            <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">
              Catatan <span class="text-slate-600 normal-case tracking-normal">(opsional — nama pengirim, dll)</span>
            </label>
            <input v-model="catatan" maxlength="255" class="input" placeholder="mis. transfer a/n Budi Santoso">
          </div>

          <button type="button" :disabled="loading" class="btn-primary w-full" @click="ajukan">
            {{ loading ? 'Mengirim…' : 'Kirim Bukti & Ajukan Booking' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
