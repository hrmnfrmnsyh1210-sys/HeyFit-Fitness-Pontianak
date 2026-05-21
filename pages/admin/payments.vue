<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Pembayaran — Heyfit' })

interface PaymentRow {
  id: number
  userId: number
  userNama: string | null
  userEmail: string | null
  jenis: 'membership' | 'kelas'
  paket: string | null
  classId: number | null
  kelasNama: string | null
  nominal: number
  buktiTransfer: string
  catatan: string | null
  status: 'menunggu' | 'disetujui' | 'ditolak'
  catatanAdmin: string | null
  createdAt: string
  reviewedAt: string | null
}

const statusTabs = [
  { id: 'menunggu', label: 'Menunggu' },
  { id: 'disetujui', label: 'Disetujui' },
  { id: 'ditolak', label: 'Ditolak' },
] as const

const statusFilter = ref<'menunggu' | 'disetujui' | 'ditolak'>('menunggu')
const paketLabel: Record<string, string> = {
  bulanan: 'Bulanan', '3bulan': '3 Bulan', tahunan: 'Tahunan',
}

const { data, pending, error, refresh } = await useFetch<{ data: PaymentRow[] }>(
  '/api/admin/payments',
  { query: { status: statusFilter } },
)
const list = computed(() => data.value?.data ?? [])

const busyId = ref<number | null>(null)
const rejectingId = ref<number | null>(null)
const rejectCatatan = ref('')
const actionError = ref('')
const lightbox = ref('')

function mulaiTolak(id: number) {
  rejectingId.value = id
  rejectCatatan.value = ''
  actionError.value = ''
}

async function review(p: PaymentRow, action: 'approve' | 'reject') {
  actionError.value = ''
  busyId.value = p.id
  try {
    await $fetch(`/api/admin/payments/${p.id}/review`, {
      method: 'POST',
      body: { action, catatan: action === 'reject' ? rejectCatatan.value : '' },
    })
    rejectingId.value = null
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    actionError.value = err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal memproses pengajuan.'
  }
  finally {
    busyId.value = null
  }
}

function badge(s: string) {
  if (s === 'disetujui') return 'border-brand-400/30 text-brand-300 bg-brand-400/10'
  if (s === 'ditolak') return 'border-rose-400/30 text-rose-300 bg-rose-400/10'
  return 'border-amber-400/30 text-amber-300 bg-amber-400/10'
}
</script>

<template>
  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <div class="mb-6">
      <p class="chip mb-3">Manajemen</p>
      <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Pembayaran</h1>
      <p class="text-slate-400 mt-1">Tinjau bukti transfer member lalu setujui atau tolak.</p>
    </div>

    <!-- tabs status -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="t in statusTabs"
        :key="t.id"
        type="button"
        :class="[
          'rounded-full px-4 py-1.5 text-sm font-medium transition border',
          statusFilter === t.id
            ? 'border-brand-400/60 bg-brand-400/15 text-brand-300'
            : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20',
        ]"
        @click="statusFilter = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="error" class="card p-5 mb-4 border-rose-500/30 bg-rose-500/[0.06]">
      <p class="text-rose-300 text-sm font-semibold">Gagal memuat pembayaran.</p>
      <p class="text-slate-400 text-xs mt-1">
        Jalankan <code class="text-brand-300">npm run db:migrate-payments</code> untuk membuat tabelnya.
      </p>
    </div>

    <div
      v-if="actionError"
      class="card p-4 mb-4 border-rose-500/30 bg-rose-500/[0.06] text-rose-300 text-sm"
    >
      {{ actionError }}
    </div>

    <div v-if="pending" class="card p-16 text-center text-slate-500 text-sm">Memuat…</div>

    <div v-else-if="!list.length" class="card p-16 text-center">
      <p class="text-3xl mb-2">💳</p>
      <p class="text-white font-semibold">Tidak ada pengajuan {{ statusFilter }}</p>
      <p class="text-slate-500 text-sm mt-1">Pengajuan pembayaran akan muncul di sini.</p>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="p in list"
        :key="p.id"
        class="card p-5 flex flex-col sm:flex-row gap-5"
      >
        <!-- bukti transfer -->
        <button
          type="button"
          class="shrink-0 w-full sm:w-44 rounded-xl overflow-hidden border border-white/10 bg-black/40"
          @click="lightbox = p.buktiTransfer"
        >
          <img :src="p.buktiTransfer" alt="Bukti transfer" class="w-full h-44 object-cover">
        </button>

        <!-- detail -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-white font-semibold truncate">{{ p.userNama ?? 'Member' }}</p>
              <p class="text-xs text-slate-500 truncate">{{ p.userEmail }}</p>
            </div>
            <span :class="['shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold', badge(p.status)]">
              {{ p.status }}
            </span>
          </div>

          <div class="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p class="text-sm text-white font-medium">
              {{ p.jenis === 'membership'
                ? `Membership — Paket ${paketLabel[p.paket ?? ''] ?? p.paket}`
                : `Kelas — ${p.kelasNama ?? 'Kelas dihapus'}` }}
            </p>
            <p class="mt-1 font-display text-xl font-extrabold text-brand-300">{{ rupiah(p.nominal) }}</p>
            <p class="text-xs text-slate-500 mt-0.5">
              Transfer Bank · diajukan {{ tanggalID(p.createdAt) }}
            </p>
            <p v-if="p.catatan" class="text-xs text-slate-400 mt-1.5">
              Catatan member: <span class="text-slate-300">{{ p.catatan }}</span>
            </p>
            <p v-if="p.catatanAdmin" class="text-xs text-slate-400 mt-1.5">
              Catatan admin: <span class="text-slate-300">{{ p.catatanAdmin }}</span>
            </p>
          </div>

          <!-- form tolak -->
          <div v-if="rejectingId === p.id" class="mt-3">
            <input
              v-model="rejectCatatan"
              maxlength="255"
              class="input"
              placeholder="Alasan penolakan (opsional)"
            >
            <div class="mt-2 flex gap-2">
              <button
                type="button"
                class="btn-ghost !py-1.5 !px-3 text-xs flex-1"
                :disabled="busyId === p.id"
                @click="rejectingId = null"
              >
                Batal
              </button>
              <button
                type="button"
                class="btn !py-1.5 !px-3 text-xs flex-1 border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                :disabled="busyId === p.id"
                @click="review(p, 'reject')"
              >
                {{ busyId === p.id ? 'Memproses…' : 'Konfirmasi Tolak' }}
              </button>
            </div>
          </div>

          <!-- aksi -->
          <div v-else-if="p.status === 'menunggu'" class="mt-3 flex gap-2">
            <button
              type="button"
              class="btn-ghost !py-1.5 !px-3 text-xs flex-1"
              :disabled="busyId === p.id"
              @click="mulaiTolak(p.id)"
            >
              Tolak
            </button>
            <button
              type="button"
              class="btn-primary !py-1.5 !px-3 text-xs flex-1"
              :disabled="busyId === p.id"
              @click="review(p, 'approve')"
            >
              {{ busyId === p.id ? 'Memproses…' : 'Setujui' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- lightbox bukti -->
    <div
      v-if="lightbox"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 backdrop-blur-sm p-6"
      @click="lightbox = ''"
    >
      <img :src="lightbox" alt="Bukti transfer" class="max-h-[88vh] max-w-full rounded-xl">
    </div>
  </section>
</template>
