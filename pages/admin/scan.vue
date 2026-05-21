<script setup lang="ts">
import type { Html5Qrcode } from 'html5-qrcode'

definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Scan QR Member — Heyfit' })

interface ScanResult {
  member: { id: number, nama: string, email: string, role: string }
  membership: { paket: string, berakhir: string, sisaHari: number, aktif: boolean } | null
  checkIn: { at: string, duplikat: boolean }
  totalKunjungan: number
}

const paketLabel: Record<string, string> = {
  bulanan: 'Bulanan', '3bulan': '3 Bulan', tahunan: 'Tahunan',
}

const result = ref<ScanResult | null>(null)
const errorMsg = ref('')
const loading = ref(false)
const manualToken = ref('')
const cameraActive = ref(false)
const cameraError = ref('')

let scanner: Html5Qrcode | null = null
// Cegah satu QR diproses berkali-kali dari frame kamera yang beruntun.
let processing = false

async function submitToken(token: string) {
  const t = token.trim()
  if (!t || processing) return
  processing = true
  loading.value = true
  errorMsg.value = ''
  result.value = null

  try {
    result.value = await $fetch<ScanResult>('/api/admin/scan', {
      method: 'POST',
      body: { token: t },
    })
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    errorMsg.value = err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal memproses QR.'
  }
  finally {
    loading.value = false
    // Jeda singkat supaya admin sempat melihat hasil sebelum scan berikutnya.
    setTimeout(() => { processing = false }, 2000)
  }
}

function submitManual() {
  const t = manualToken.value
  manualToken.value = ''
  submitToken(t)
}

async function startCamera() {
  cameraError.value = ''
  try {
    const { Html5Qrcode } = await import('html5-qrcode')
    scanner = new Html5Qrcode('qr-reader')
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      decodedText => submitToken(decodedText),
      () => {}, // error per-frame (QR belum terbaca) — diabaikan
    )
    cameraActive.value = true
  }
  catch {
    cameraError.value = 'Tidak bisa mengakses kamera. Gunakan input manual di bawah.'
    scanner = null
  }
}

async function stopCamera() {
  if (!scanner) return
  try { await scanner.stop() }
  catch { /* sudah berhenti */ }
  try { scanner.clear() }
  catch { /* abaikan */ }
  scanner = null
  cameraActive.value = false
}

function formatJam(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function formatTanggal(str: string) {
  return new Date(str).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

onBeforeUnmount(stopCamera)
</script>

<template>
  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="mb-8">
      <p class="chip mb-3">Admin Console</p>
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-white">Scan QR Member</h1>
      <p class="text-slate-400 mt-1">Pindai QR member untuk mencatat kehadiran (check-in).</p>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <!-- SCANNER -->
      <div class="card p-6">
        <h2 class="font-display text-lg font-bold text-white mb-4">Kamera</h2>

        <div class="relative aspect-square rounded-2xl overflow-hidden bg-ink-900 border border-white/10">
          <div id="qr-reader" class="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
          <div
            v-if="!cameraActive"
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink-900 px-6 text-center"
          >
            <svg class="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <button class="btn-primary" @click="startCamera">Nyalakan kamera</button>
            <p v-if="cameraError" class="text-rose-400 text-xs">{{ cameraError }}</p>
          </div>
        </div>

        <button v-if="cameraActive" class="btn-ghost w-full mt-3" @click="stopCamera">
          Matikan kamera
        </button>
        <p class="text-xs text-slate-500 mt-3">
          Arahkan QR member ke dalam kotak. Hasil scan muncul otomatis di sebelah.
        </p>

        <!-- INPUT MANUAL -->
        <div class="mt-5 pt-5 border-t border-white/[0.06]">
          <label class="text-xs uppercase tracking-widest text-slate-500">Input manual</label>
          <form class="mt-2 flex gap-2" @submit.prevent="submitManual">
            <input
              v-model="manualToken"
              type="text"
              placeholder="Tempel kode QR member"
              class="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none"
            >
            <button type="submit" class="btn-primary shrink-0" :disabled="!manualToken.trim()">
              Cek
            </button>
          </form>
        </div>
      </div>

      <!-- HASIL -->
      <div class="card p-6">
        <h2 class="font-display text-lg font-bold text-white mb-4">Hasil Scan</h2>

        <div v-if="loading" class="flex items-center gap-3 text-slate-400 text-sm py-8 justify-center">
          <span class="h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
          Memproses…
        </div>

        <div v-else-if="errorMsg" class="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-5 text-center">
          <p class="text-2xl mb-1">⚠️</p>
          <p class="text-rose-300 font-semibold">{{ errorMsg }}</p>
        </div>

        <div v-else-if="result">
          <!-- banner check-in -->
          <div
            :class="[
              'rounded-xl p-4 mb-4 flex items-center gap-3',
              result.checkIn.duplikat
                ? 'border border-amber-500/30 bg-amber-500/[0.06]'
                : 'border border-brand-400/30 bg-brand-400/[0.06]',
            ]"
          >
            <span class="text-2xl">{{ result.checkIn.duplikat ? '🕒' : '✅' }}</span>
            <div>
              <p class="text-white font-semibold text-sm">
                {{ result.checkIn.duplikat ? 'Sudah check-in barusan' : 'Check-in tercatat' }}
              </p>
              <p class="text-xs text-slate-400">{{ formatJam(result.checkIn.at) }}</p>
            </div>
          </div>

          <!-- profil member -->
          <div class="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-display text-lg font-extrabold">
              {{ result.member.nama.charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <p class="text-white font-semibold truncate">{{ result.member.nama }}</p>
              <p class="text-xs text-slate-500 truncate">{{ result.member.email }}</p>
            </div>
          </div>

          <dl class="py-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">ID Member</dt>
              <dd class="text-slate-200">HF-{{ String(result.member.id).padStart(5, '0') }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Membership</dt>
              <dd v-if="result.membership" class="text-right">
                <span :class="result.membership.aktif ? 'text-brand-300' : 'text-rose-400'" class="font-semibold">
                  {{ result.membership.aktif ? 'Aktif' : 'Kadaluarsa' }}
                </span>
                <span class="text-slate-500"> · {{ paketLabel[result.membership.paket] ?? result.membership.paket }}</span>
              </dd>
              <dd v-else class="text-slate-500">Belum ada</dd>
            </div>
            <div v-if="result.membership" class="flex justify-between gap-4">
              <dt class="text-slate-500">Berlaku s/d</dt>
              <dd class="text-slate-200">{{ formatTanggal(result.membership.berakhir) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Total kunjungan</dt>
              <dd class="text-slate-200">{{ result.totalKunjungan }}×</dd>
            </div>
          </dl>

          <!-- peringatan kalau membership tidak aktif -->
          <div
            v-if="result.membership && !result.membership.aktif"
            class="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-3 text-xs text-rose-300"
          >
            Membership member ini sudah berakhir. Arahkan untuk perpanjang sebelum masuk.
          </div>
          <div
            v-else-if="!result.membership"
            class="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 text-xs text-amber-300"
          >
            Member belum mengaktifkan membership apa pun.
          </div>
        </div>

        <div v-else class="text-center text-slate-500 text-sm py-12">
          <p class="text-3xl mb-2">📷</p>
          Belum ada scan. Nyalakan kamera atau gunakan input manual.
        </div>
      </div>
    </div>
  </section>
</template>
