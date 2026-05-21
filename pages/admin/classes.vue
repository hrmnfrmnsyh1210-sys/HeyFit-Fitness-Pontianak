<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Manajemen Kelas — Heyfit' })

interface ClassRow {
  id: number
  nama: string
  kategori: string
  instructorId: number | null
  instrukturNama: string | null
  jadwal: string
  durasiMenit: number
  kuota: number
  intensitas: number
  aktif: boolean
}
interface InstructorRow { id: number, nama: string, aktif: boolean }

const KATEGORI = ['Mind & Body', 'Cardio', 'Strength', 'Dance']
const katColor: Record<string, string> = {
  'Mind & Body': 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10',
  'Cardio': 'border-rose-400/30 text-rose-300 bg-rose-400/10',
  'Strength': 'border-sky-400/30 text-sky-300 bg-sky-400/10',
  'Dance': 'border-fuchsia-400/30 text-fuchsia-300 bg-fuchsia-400/10',
}
const intensitasLabel: Record<number, string> = { 1: 'Ringan', 2: 'Sedang', 3: 'Berat' }

const { data: classData, pending, error, refresh } = await useFetch<{ data: ClassRow[] }>('/api/admin/classes')
const { data: instrData } = await useFetch<{ data: InstructorRow[] }>('/api/admin/instructors')

// --- modal form ---
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  nama: '',
  kategori: 'Mind & Body',
  instructorId: '' as number | '',
  jadwal: '',
  durasiMenit: 60,
  kuota: 15,
  intensitas: 2,
  aktif: true,
})

function openCreate() {
  editingId.value = null
  Object.assign(form, {
    nama: '', kategori: 'Mind & Body', instructorId: '', jadwal: '',
    durasiMenit: 60, kuota: 15, intensitas: 2, aktif: true,
  })
  formError.value = ''
  showForm.value = true
}

function openEdit(c: ClassRow) {
  editingId.value = c.id
  Object.assign(form, {
    nama: c.nama, kategori: c.kategori, instructorId: c.instructorId ?? '',
    jadwal: c.jadwal, durasiMenit: c.durasiMenit, kuota: c.kuota,
    intensitas: c.intensitas, aktif: c.aktif,
  })
  formError.value = ''
  showForm.value = true
}

async function submitForm() {
  saving.value = true
  formError.value = ''
  const body = {
    nama: form.nama,
    kategori: form.kategori,
    instructorId: form.instructorId === '' ? null : form.instructorId,
    jadwal: form.jadwal,
    durasiMenit: form.durasiMenit,
    kuota: form.kuota,
    intensitas: form.intensitas,
    aktif: form.aktif,
  }
  try {
    if (editingId.value)
      await $fetch(`/api/admin/classes/${editingId.value}`, { method: 'PATCH', body })
    else
      await $fetch('/api/admin/classes', { method: 'POST', body })
    showForm.value = false
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

const busyId = ref<number | null>(null)

async function toggleAktif(c: ClassRow) {
  busyId.value = c.id
  try {
    await $fetch(`/api/admin/classes/${c.id}`, { method: 'PATCH', body: { aktif: !c.aktif } })
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    alert(err?.data?.statusMessage ?? 'Gagal mengubah status.')
  }
  finally {
    busyId.value = null
  }
}

async function hapusKelas(c: ClassRow) {
  if (!confirm(`Hapus kelas "${c.nama}"?`)) return
  busyId.value = c.id
  try {
    await $fetch(`/api/admin/classes/${c.id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    alert(err?.data?.statusMessage ?? 'Gagal menghapus kelas.')
  }
  finally {
    busyId.value = null
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p class="chip mb-3">Manajemen</p>
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Kelas</h1>
        <p class="text-slate-400 mt-1">Atur jadwal, kuota, dan instruktur tiap kelas.</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ Tambah Kelas</button>
    </div>

    <div v-if="error" class="card p-5 mb-4 border-rose-500/30 bg-rose-500/[0.06]">
      <p class="text-rose-300 text-sm font-semibold">Gagal memuat kelas.</p>
      <p class="text-slate-400 text-xs mt-1">
        Jalankan <code class="text-brand-300">npm run db:migrate-admin</code> untuk membuat tabelnya.
      </p>
    </div>

    <div v-if="pending" class="card p-16 text-center text-slate-500 text-sm">Memuat…</div>

    <div v-else-if="!classData?.data.length" class="card p-16 text-center">
      <p class="text-3xl mb-2">🗓️</p>
      <p class="text-white font-semibold">Belum ada kelas</p>
      <p class="text-slate-500 text-sm mt-1">Tambahkan kelas pertama untuk mulai.</p>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="c in classData.data"
        :key="c.id"
        :class="['card p-5 flex flex-col', !c.aktif && 'opacity-60']"
      >
        <div class="flex items-start justify-between gap-2 mb-3">
          <span :class="['inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium', katColor[c.kategori]]">
            {{ c.kategori }}
          </span>
          <span
            :class="[
              'inline-flex items-center gap-1 text-[11px] font-medium',
              c.aktif ? 'text-brand-300' : 'text-slate-500',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="c.aktif ? 'bg-brand-400' : 'bg-slate-600'" />
            {{ c.aktif ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>

        <h3 class="font-display text-lg font-bold text-white">{{ c.nama }}</h3>
        <p class="text-xs text-slate-500 mt-0.5">
          w/ {{ c.instrukturNama ?? 'Belum ada instruktur' }}
        </p>

        <dl class="mt-3 space-y-1.5 text-xs">
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Jadwal</dt>
            <dd class="text-slate-300 text-right">{{ c.jadwal }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Durasi</dt>
            <dd class="text-slate-300">{{ c.durasiMenit }} menit</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-slate-500">Kuota</dt>
            <dd class="text-slate-300">{{ c.kuota }} orang</dd>
          </div>
          <div class="flex justify-between gap-3 items-center">
            <dt class="text-slate-500">Intensitas</dt>
            <dd class="flex items-center gap-1">
              <span
                v-for="i in 3"
                :key="i"
                class="h-1.5 w-3 rounded-full"
                :class="i <= c.intensitas ? 'bg-brand-400' : 'bg-white/15'"
              />
              <span class="text-slate-400 ml-1">{{ intensitasLabel[c.intensitas] }}</span>
            </dd>
          </div>
        </dl>

        <div class="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <button class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="busyId === c.id" @click="openEdit(c)">
            Edit
          </button>
          <button class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="busyId === c.id" @click="toggleAktif(c)">
            {{ c.aktif ? 'Nonaktifkan' : 'Aktifkan' }}
          </button>
          <button
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-400/40 transition disabled:opacity-50"
            :disabled="busyId === c.id"
            title="Hapus"
            @click="hapusKelas(c)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </article>
    </div>

    <!-- modal -->
    <AdminModal
      v-if="showForm"
      :title="editingId ? 'Edit Kelas' : 'Tambah Kelas'"
      subtitle="Lengkapi detail kelas di bawah."
      @close="showForm = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Nama kelas</label>
          <input v-model="form.nama" type="text" required class="input mt-1.5" placeholder="mis. Yoga Flow">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs uppercase tracking-widest text-slate-500">Kategori</label>
            <select v-model="form.kategori" class="input mt-1.5">
              <option v-for="k in KATEGORI" :key="k" :value="k">{{ k }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs uppercase tracking-widest text-slate-500">Instruktur</label>
            <select v-model="form.instructorId" class="input mt-1.5">
              <option :value="''">— Tanpa instruktur —</option>
              <option v-for="i in instrData?.data ?? []" :key="i.id" :value="i.id">{{ i.nama }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Jadwal</label>
          <input v-model="form.jadwal" type="text" required class="input mt-1.5" placeholder="mis. Sen & Rab · 18:00">
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs uppercase tracking-widest text-slate-500">Durasi (mnt)</label>
            <input v-model.number="form.durasiMenit" type="number" min="1" required class="input mt-1.5">
          </div>
          <div>
            <label class="text-xs uppercase tracking-widest text-slate-500">Kuota</label>
            <input v-model.number="form.kuota" type="number" min="1" required class="input mt-1.5">
          </div>
          <div>
            <label class="text-xs uppercase tracking-widest text-slate-500">Intensitas</label>
            <select v-model.number="form.intensitas" class="input mt-1.5">
              <option :value="1">Ringan</option>
              <option :value="2">Sedang</option>
              <option :value="3">Berat</option>
            </select>
          </div>
        </div>
        <label class="flex items-center gap-2.5 text-sm text-slate-300">
          <input v-model="form.aktif" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-brand-400">
          Kelas aktif (tampil & bisa dibooking)
        </label>

        <p v-if="formError" class="text-rose-400 text-sm">{{ formError }}</p>

        <div class="flex gap-2 pt-1">
          <button type="button" class="btn-ghost flex-1" @click="showForm = false">Batal</button>
          <button type="submit" class="btn-primary flex-1" :disabled="saving">
            {{ saving ? 'Menyimpan…' : 'Simpan' }}
          </button>
        </div>
      </form>
    </AdminModal>
  </section>
</template>
