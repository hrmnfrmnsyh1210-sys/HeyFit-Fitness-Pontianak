<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Riwayat Kehadiran — Heyfit' })

interface AttendanceRow {
  id: number
  at: string
  memberId: number
  memberNama: string
  memberEmail: string
  scannedBy: string | null
}
interface AttResponse {
  data: AttendanceRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const searchRaw = ref('')
const q = ref('')
const dateFilter = ref('')
const page = ref(1)

let timer: ReturnType<typeof setTimeout>
watch(searchRaw, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { q.value = v.trim(); page.value = 1 }, 350)
})
watch(dateFilter, () => { page.value = 1 })

const { data, pending } = await useFetch<AttResponse>('/api/admin/attendances', {
  query: { q, date: dateFilter, page },
})

function formatDateTime(str: string) {
  return new Date(str).toLocaleString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}
function goPage(n: number) {
  const max = data.value?.totalPages ?? 1
  page.value = Math.min(Math.max(1, n), max)
}
function resetFilter() {
  searchRaw.value = ''
  q.value = ''
  dateFilter.value = ''
  page.value = 1
}
</script>

<template>
  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <div class="mb-6">
      <p class="chip mb-3">Manajemen</p>
      <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Riwayat Kehadiran</h1>
      <p class="text-slate-400 mt-1">Log check-in seluruh member dari hasil scan QR.</p>
    </div>

    <!-- filter -->
    <div class="card p-4 mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="searchRaw"
          type="text"
          placeholder="Cari nama atau email member…"
          class="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none"
        >
      </div>
      <input
        v-model="dateFilter"
        type="date"
        class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-brand-400/50 focus:outline-none [color-scheme:dark]"
      >
      <button class="btn-ghost !py-2.5 text-sm" @click="resetFilter">Reset</button>
    </div>

    <!-- list -->
    <div class="card overflow-hidden">
      <div class="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-white/[0.06] text-[11px] uppercase tracking-widest text-slate-500">
        <span class="flex-1">Member</span>
        <span class="w-48">Waktu check-in</span>
        <span class="w-36">Dicatat oleh</span>
      </div>

      <div v-if="pending" class="py-16 text-center text-slate-500 text-sm">Memuat…</div>

      <p v-else-if="!data?.data.length" class="py-16 text-center text-slate-500 text-sm">
        Tidak ada kehadiran yang cocok.
      </p>

      <ul v-else class="divide-y divide-white/[0.06]">
        <li v-for="r in data.data" :key="r.id" class="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-3">
          <NuxtLink :to="`/admin/members/${r.memberId}`" class="flex items-center gap-3 flex-1 min-w-[200px] group">
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-bold text-sm">
              {{ r.memberNama.charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition">{{ r.memberNama }}</p>
              <p class="text-xs text-slate-500 truncate">{{ r.memberEmail }}</p>
            </div>
          </NuxtLink>
          <div class="sm:w-48 text-sm text-slate-300">{{ formatDateTime(r.at) }}</div>
          <div class="sm:w-36 text-sm text-slate-500">{{ r.scannedBy ?? '—' }}</div>
        </li>
      </ul>
    </div>

    <!-- pagination -->
    <div v-if="data && data.total > 0" class="flex items-center justify-between gap-4 mt-4">
      <p class="text-xs text-slate-500">
        {{ data.total }} check-in · halaman {{ data.page }} dari {{ data.totalPages }}
      </p>
      <div class="flex gap-2">
        <button class="btn-ghost !py-2 !px-3 text-xs" :disabled="data.page <= 1" @click="goPage(data.page - 1)">
          ← Sebelumnya
        </button>
        <button class="btn-ghost !py-2 !px-3 text-xs" :disabled="data.page >= data.totalPages" @click="goPage(data.page + 1)">
          Berikutnya →
        </button>
      </div>
    </div>
  </section>
</template>
