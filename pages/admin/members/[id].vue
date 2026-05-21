<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })

interface DetailResponse {
  user: {
    id: number
    nama: string
    email: string
    role: 'member' | 'admin' | 'owner'
    qrToken: string | null
    createdAt: string
  }
  membership: { paket: string, mulai: string, berakhir: string, sisaHari: number, aktif: boolean } | null
  totalKunjungan: number
  riwayat: { id: number, at: string }[]
}

const route = useRoute()
const id = route.params.id as string

const { data, pending, error, refresh } = await useFetch<DetailResponse>(`/api/admin/members/${id}`)

useHead({ title: () => `${data.value?.user.nama ?? 'Member'} — Heyfit` })

const paketLabel: Record<string, string> = { bulanan: 'Bulanan', '3bulan': '3 Bulan', tahunan: 'Tahunan' }
const paketActions = [
  { id: 'bulanan', label: 'Bulanan', durasi: '30 hari' },
  { id: '3bulan', label: '3 Bulan', durasi: '90 hari' },
  { id: 'tahunan', label: 'Tahunan', durasi: '365 hari' },
]

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDateTime(str: string) {
  return new Date(str).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// --- edit profil ---
const editing = ref(false)
const form = reactive({ nama: '', email: '', role: 'member' })
const savingProfile = ref(false)
const profileError = ref('')

function startEdit() {
  if (!data.value) return
  form.nama = data.value.user.nama
  form.email = data.value.user.email
  form.role = data.value.user.role
  profileError.value = ''
  editing.value = true
}

async function saveProfile() {
  savingProfile.value = true
  profileError.value = ''
  try {
    await $fetch(`/api/admin/members/${id}`, { method: 'PATCH', body: { ...form } })
    editing.value = false
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    profileError.value = err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal menyimpan.'
  }
  finally {
    savingProfile.value = false
  }
}

// --- membership ---
const membershipBusy = ref('')
const membershipError = ref('')

async function setPaket(paket: string) {
  membershipBusy.value = paket
  membershipError.value = ''
  try {
    await $fetch('/api/admin/membership', { method: 'POST', body: { userId: Number(id), paket } })
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    membershipError.value = err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal memproses.'
  }
  finally {
    membershipBusy.value = ''
  }
}

async function cancelMembership() {
  if (!confirm('Batalkan membership member ini? Data keanggotaan akan dihapus.')) return
  membershipBusy.value = 'cancel'
  membershipError.value = ''
  try {
    await $fetch('/api/admin/membership', { method: 'POST', body: { userId: Number(id), action: 'cancel' } })
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    membershipError.value = err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal memproses.'
  }
  finally {
    membershipBusy.value = ''
  }
}

// --- hapus member ---
const deleting = ref(false)
async function deleteMember() {
  if (!data.value) return
  if (!confirm(`Hapus member "${data.value.user.nama}"? Membership & riwayat kehadiran ikut terhapus. Aksi ini tidak bisa dibatalkan.`)) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/members/${id}`, { method: 'DELETE' })
    await navigateTo('/admin/members')
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    alert(err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal menghapus member.')
    deleting.value = false
  }
}
</script>

<template>
  <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <NuxtLink to="/admin/members" class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-300 mb-5">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Kembali ke daftar member
    </NuxtLink>

    <div v-if="pending" class="card p-16 text-center text-slate-500 text-sm">Memuat…</div>

    <div v-else-if="error || !data" class="card p-12 text-center">
      <p class="text-3xl mb-2">🔍</p>
      <p class="text-white font-semibold">Member tidak ditemukan</p>
      <p class="text-slate-500 text-sm mt-1">Data mungkin sudah dihapus.</p>
      <NuxtLink to="/admin/members" class="btn-ghost mt-4 inline-flex">Kembali</NuxtLink>
    </div>

    <template v-else>
      <!-- header -->
      <div class="flex items-center gap-4 mb-6">
        <span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-display text-xl font-extrabold">
          {{ data.user.nama.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0">
          <h1 class="font-display text-2xl font-extrabold text-white truncate">{{ data.user.nama }}</h1>
          <p class="text-slate-500 text-sm truncate">{{ data.user.email }}</p>
        </div>
        <span class="ml-auto chip capitalize">{{ data.user.role }}</span>
      </div>

      <div class="grid lg:grid-cols-3 gap-4">
        <!-- left column -->
        <div class="lg:col-span-2 space-y-4">
          <!-- profil / edit -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-display text-lg font-bold text-white">Profil</h2>
              <button v-if="!editing" class="btn-ghost !py-1.5 !px-3 text-xs" @click="startEdit">Edit</button>
            </div>

            <dl v-if="!editing" class="space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">ID Member</dt>
                <dd class="text-slate-200">HF-{{ String(data.user.id).padStart(5, '0') }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Nama</dt>
                <dd class="text-slate-200">{{ data.user.nama }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Email</dt>
                <dd class="text-slate-200 truncate">{{ data.user.email }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Role</dt>
                <dd class="text-slate-200 capitalize">{{ data.user.role }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-slate-500">Bergabung</dt>
                <dd class="text-slate-200">{{ formatDate(data.user.createdAt) }}</dd>
              </div>
            </dl>

            <form v-else class="space-y-4" @submit.prevent="saveProfile">
              <div>
                <label class="text-xs uppercase tracking-widest text-slate-500">Nama</label>
                <input v-model="form.nama" type="text" required class="input mt-1.5">
              </div>
              <div>
                <label class="text-xs uppercase tracking-widest text-slate-500">Email</label>
                <input v-model="form.email" type="email" required class="input mt-1.5">
              </div>
              <div>
                <label class="text-xs uppercase tracking-widest text-slate-500">Role</label>
                <select v-model="form.role" class="input mt-1.5">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <p v-if="profileError" class="text-rose-400 text-sm">{{ profileError }}</p>
              <div class="flex gap-2">
                <button type="button" class="btn-ghost flex-1" @click="editing = false">Batal</button>
                <button type="submit" class="btn-primary flex-1" :disabled="savingProfile">
                  {{ savingProfile ? 'Menyimpan…' : 'Simpan' }}
                </button>
              </div>
            </form>
          </div>

          <!-- membership -->
          <div class="card p-6">
            <h2 class="font-display text-lg font-bold text-white mb-4">Membership</h2>

            <div
              v-if="data.membership"
              :class="[
                'rounded-xl border p-4 mb-4',
                data.membership.aktif
                  ? 'border-brand-400/30 bg-brand-400/[0.06]'
                  : 'border-rose-500/30 bg-rose-500/[0.06]',
              ]"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold" :class="data.membership.aktif ? 'text-brand-300' : 'text-rose-300'">
                    {{ data.membership.aktif ? 'Aktif' : 'Kadaluarsa' }}
                    · {{ paketLabel[data.membership.paket] ?? data.membership.paket }}
                  </p>
                  <p class="text-xs text-slate-400 mt-0.5">
                    {{ formatDate(data.membership.mulai) }} — {{ formatDate(data.membership.berakhir) }}
                  </p>
                </div>
                <span class="font-display text-2xl font-extrabold" :class="data.membership.aktif ? 'text-white' : 'text-rose-300'">
                  {{ data.membership.sisaHari >= 0 ? `${data.membership.sisaHari}h` : 'lewat' }}
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-slate-500 mb-4">Member ini belum punya membership.</p>

            <p class="text-xs uppercase tracking-widest text-slate-500 mb-2">
              {{ data.membership && data.membership.aktif ? 'Perpanjang paket' : 'Aktifkan paket' }}
            </p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="p in paketActions"
                :key="p.id"
                type="button"
                class="rounded-xl border border-white/10 p-3 text-center hover:border-brand-400/50 hover:bg-white/[0.03] transition disabled:opacity-50"
                :disabled="!!membershipBusy"
                @click="setPaket(p.id)"
              >
                <p class="text-sm font-semibold text-white">{{ p.label }}</p>
                <p class="text-[11px] text-slate-500">
                  {{ membershipBusy === p.id ? 'memproses…' : `+${p.durasi}` }}
                </p>
              </button>
            </div>

            <button
              v-if="data.membership"
              type="button"
              class="mt-3 text-xs text-rose-400 hover:text-rose-300 disabled:opacity-50"
              :disabled="!!membershipBusy"
              @click="cancelMembership"
            >
              {{ membershipBusy === 'cancel' ? 'Membatalkan…' : 'Batalkan membership' }}
            </button>
            <p v-if="membershipError" class="text-rose-400 text-sm mt-2">{{ membershipError }}</p>
          </div>

          <!-- danger zone -->
          <div class="card p-6 border-rose-500/20">
            <h2 class="font-display text-base font-bold text-white mb-1">Hapus Member</h2>
            <p class="text-xs text-slate-500 mb-3">
              Menghapus member akan menghapus membership & riwayat kehadirannya secara permanen.
            </p>
            <button
              type="button"
              class="btn border border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
              :disabled="deleting"
              @click="deleteMember"
            >
              {{ deleting ? 'Menghapus…' : 'Hapus member ini' }}
            </button>
          </div>
        </div>

        <!-- right column -->
        <div class="space-y-4">
          <div class="card p-6">
            <p class="text-xs uppercase tracking-widest text-slate-500">Total Kunjungan</p>
            <p class="font-display text-4xl font-extrabold text-white mt-1">{{ data.totalKunjungan }}</p>
            <p class="text-xs text-slate-500 mt-1">check-in tercatat</p>
            <div v-if="data.user.qrToken" class="mt-4 pt-4 border-t border-white/[0.06]">
              <p class="text-xs uppercase tracking-widest text-slate-500 mb-1">Token QR</p>
              <p class="text-xs text-slate-400 font-mono break-all">{{ data.user.qrToken }}</p>
            </div>
          </div>

          <div class="card p-6">
            <h2 class="font-display text-base font-bold text-white mb-3">Riwayat Kehadiran</h2>
            <ul v-if="data.riwayat.length" class="space-y-2.5">
              <li v-for="r in data.riwayat" :key="r.id" class="flex items-center gap-2.5 text-sm">
                <span class="h-1.5 w-1.5 rounded-full bg-brand-400 shrink-0" />
                <span class="text-slate-300">{{ formatDateTime(r.at) }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-slate-500">Belum ada check-in.</p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
