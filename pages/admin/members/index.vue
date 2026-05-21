<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Manajemen Member — Heyfit' })

interface MemberRow {
  id: number
  nama: string
  email: string
  role: 'member' | 'admin' | 'owner'
  createdAt: string
  membership: { paket: string, berakhir: string, sisaHari: number, aktif: boolean } | null
}
interface MembersResponse {
  data: MemberRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const paketLabel: Record<string, string> = { bulanan: 'Bulanan', '3bulan': '3 Bulan', tahunan: 'Tahunan' }
const roleBadge: Record<string, string> = {
  member: 'border-white/10 text-slate-300',
  admin: 'border-sky-400/30 text-sky-300 bg-sky-400/10',
  owner: 'border-brand-400/30 text-brand-300 bg-brand-400/10',
}

// --- filter & pagination ---
const searchRaw = ref('')
const q = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const page = ref(1)

let timer: ReturnType<typeof setTimeout>
watch(searchRaw, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => { q.value = v.trim(); page.value = 1 }, 350)
})
watch([roleFilter, statusFilter], () => { page.value = 1 })

const { data, pending, refresh } = await useFetch<MembersResponse>('/api/admin/members', {
  query: { q, role: roleFilter, status: statusFilter, page },
})

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function goPage(n: number) {
  const max = data.value?.totalPages ?? 1
  page.value = Math.min(Math.max(1, n), max)
}

// --- modal tambah member ---
const showCreate = ref(false)
const form = reactive({ nama: '', email: '', password: '', role: 'member' })
const saving = ref(false)
const formError = ref('')

function openCreate() {
  form.nama = ''
  form.email = ''
  form.password = ''
  form.role = 'member'
  formError.value = ''
  showCreate.value = true
}

async function submitCreate() {
  saving.value = true
  formError.value = ''
  try {
    await $fetch('/api/admin/members', { method: 'POST', body: { ...form } })
    showCreate.value = false
    page.value = 1
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }, statusMessage?: string }
    formError.value = err?.data?.statusMessage ?? err?.statusMessage ?? 'Gagal menyimpan.'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p class="chip mb-3">Manajemen</p>
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Member</h1>
        <p class="text-slate-400 mt-1">Kelola akun, role, dan keanggotaan.</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ Tambah Member</button>
    </div>

    <!-- filter -->
    <div class="card p-4 mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="relative sm:col-span-2 lg:col-span-2">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="searchRaw"
          type="text"
          placeholder="Cari nama atau email…"
          class="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-brand-400/50 focus:outline-none"
        >
      </div>
      <select v-model="roleFilter" class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-brand-400/50 focus:outline-none">
        <option value="">Semua role</option>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
        <option value="owner">Owner</option>
      </select>
      <select v-model="statusFilter" class="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-brand-400/50 focus:outline-none">
        <option value="">Semua membership</option>
        <option value="aktif">Membership aktif</option>
        <option value="kadaluarsa">Kadaluarsa</option>
        <option value="tanpa">Tanpa membership</option>
      </select>
    </div>

    <!-- list -->
    <div class="card overflow-hidden">
      <div class="hidden md:flex items-center gap-4 px-4 py-2.5 border-b border-white/[0.06] text-[11px] uppercase tracking-widest text-slate-500">
        <span class="flex-1">Member</span>
        <span class="w-20">Role</span>
        <span class="w-40">Membership</span>
        <span class="w-24">Bergabung</span>
        <span class="w-5" />
      </div>

      <div v-if="pending" class="py-16 text-center text-slate-500 text-sm">Memuat…</div>

      <p v-else-if="!data?.data.length" class="py-16 text-center text-slate-500 text-sm">
        Tidak ada member yang cocok dengan filter.
      </p>

      <ul v-else class="divide-y divide-white/[0.06]">
        <li v-for="m in data.data" :key="m.id">
          <NuxtLink
            :to="`/admin/members/${m.id}`"
            class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-white/[0.03] transition"
          >
            <div class="flex items-center gap-3 flex-1 min-w-[200px]">
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-bold text-sm">
                {{ m.nama.charAt(0).toUpperCase() }}
              </span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-white truncate">{{ m.nama }}</p>
                <p class="text-xs text-slate-500 truncate">{{ m.email }}</p>
              </div>
            </div>

            <div class="md:w-20">
              <span :class="['inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', roleBadge[m.role]]">
                {{ m.role }}
              </span>
            </div>

            <div class="md:w-40">
              <span v-if="m.membership" class="text-xs">
                <span :class="m.membership.aktif ? 'text-brand-300' : 'text-rose-400'" class="font-semibold">
                  {{ m.membership.aktif ? 'Aktif' : 'Kadaluarsa' }}
                </span>
                <span class="text-slate-500"> · {{ paketLabel[m.membership.paket] ?? m.membership.paket }}</span>
              </span>
              <span v-else class="text-xs text-slate-600">Tanpa membership</span>
            </div>

            <div class="md:w-24 text-xs text-slate-500">{{ formatDate(m.createdAt) }}</div>

            <svg class="hidden md:block w-5 h-5 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- pagination -->
    <div v-if="data && data.total > 0" class="flex items-center justify-between gap-4 mt-4">
      <p class="text-xs text-slate-500">
        {{ data.total }} member · halaman {{ data.page }} dari {{ data.totalPages }}
      </p>
      <div class="flex gap-2">
        <button
          class="btn-ghost !py-2 !px-3 text-xs"
          :disabled="data.page <= 1"
          @click="goPage(data.page - 1)"
        >
          ← Sebelumnya
        </button>
        <button
          class="btn-ghost !py-2 !px-3 text-xs"
          :disabled="data.page >= data.totalPages"
          @click="goPage(data.page + 1)"
        >
          Berikutnya →
        </button>
      </div>
    </div>

    <!-- modal tambah member -->
    <AdminModal v-if="showCreate" title="Tambah Member" subtitle="Buat akun baru untuk member atau staf." @close="showCreate = false">
      <form class="space-y-4" @submit.prevent="submitCreate">
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Nama lengkap</label>
          <input v-model="form.nama" type="text" required class="input mt-1.5" placeholder="Nama member">
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Email</label>
          <input v-model="form.email" type="email" required class="input mt-1.5" placeholder="email@contoh.com">
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Password</label>
          <input v-model="form.password" type="text" required minlength="6" class="input mt-1.5" placeholder="Minimal 6 karakter">
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Role</label>
          <select v-model="form.role" class="input mt-1.5">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <p v-if="formError" class="text-rose-400 text-sm">{{ formError }}</p>

        <div class="flex gap-2 pt-1">
          <button type="button" class="btn-ghost flex-1" @click="showCreate = false">Batal</button>
          <button type="submit" class="btn-primary flex-1" :disabled="saving">
            {{ saving ? 'Menyimpan…' : 'Simpan' }}
          </button>
        </div>
      </form>
    </AdminModal>
  </section>
</template>
