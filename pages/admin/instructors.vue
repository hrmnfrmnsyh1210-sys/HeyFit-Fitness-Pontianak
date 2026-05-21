<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Manajemen Instruktur — Heyfit' })

interface InstructorRow {
  id: number
  nama: string
  spesialisasi: string
  bio: string | null
  aktif: boolean
  jumlahKelas: number
}

const { data, pending, error, refresh } = await useFetch<{ data: InstructorRow[] }>('/api/admin/instructors')

// --- modal form ---
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ nama: '', spesialisasi: '', bio: '', aktif: true })

function openCreate() {
  editingId.value = null
  Object.assign(form, { nama: '', spesialisasi: '', bio: '', aktif: true })
  formError.value = ''
  showForm.value = true
}

function openEdit(i: InstructorRow) {
  editingId.value = i.id
  Object.assign(form, { nama: i.nama, spesialisasi: i.spesialisasi, bio: i.bio ?? '', aktif: i.aktif })
  formError.value = ''
  showForm.value = true
}

async function submitForm() {
  saving.value = true
  formError.value = ''
  const body = {
    nama: form.nama,
    spesialisasi: form.spesialisasi,
    bio: form.bio.trim() || null,
    aktif: form.aktif,
  }
  try {
    if (editingId.value)
      await $fetch(`/api/admin/instructors/${editingId.value}`, { method: 'PATCH', body })
    else
      await $fetch('/api/admin/instructors', { method: 'POST', body })
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

async function toggleAktif(i: InstructorRow) {
  busyId.value = i.id
  try {
    await $fetch(`/api/admin/instructors/${i.id}`, { method: 'PATCH', body: { aktif: !i.aktif } })
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

async function hapusInstruktur(i: InstructorRow) {
  if (!confirm(`Hapus instruktur "${i.nama}"? Kelas yang memakainya akan jadi tanpa instruktur.`)) return
  busyId.value = i.id
  try {
    await $fetch(`/api/admin/instructors/${i.id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    alert(err?.data?.statusMessage ?? 'Gagal menghapus instruktur.')
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
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Instruktur</h1>
        <p class="text-slate-400 mt-1">Kelola data pelatih dan status aktif mereka.</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ Tambah Instruktur</button>
    </div>

    <div v-if="error" class="card p-5 mb-4 border-rose-500/30 bg-rose-500/[0.06]">
      <p class="text-rose-300 text-sm font-semibold">Gagal memuat instruktur.</p>
      <p class="text-slate-400 text-xs mt-1">
        Jalankan <code class="text-brand-300">npm run db:migrate-admin</code> untuk membuat tabelnya.
      </p>
    </div>

    <div v-if="pending" class="card p-16 text-center text-slate-500 text-sm">Memuat…</div>

    <div v-else-if="!data?.data.length" class="card p-16 text-center">
      <p class="text-3xl mb-2">🏋️</p>
      <p class="text-white font-semibold">Belum ada instruktur</p>
      <p class="text-slate-500 text-sm mt-1">Tambahkan instruktur pertama untuk mulai.</p>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="i in data.data"
        :key="i.id"
        :class="['card p-5 flex flex-col', !i.aktif && 'opacity-60']"
      >
        <div class="flex items-start gap-3">
          <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-display text-lg font-extrabold">
            {{ i.nama.charAt(0).toUpperCase() }}
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="font-display text-base font-bold text-white truncate">{{ i.nama }}</h3>
            <p class="text-xs text-brand-300 truncate">{{ i.spesialisasi }}</p>
          </div>
          <span
            :class="[
              'inline-flex items-center gap-1 text-[11px] font-medium shrink-0',
              i.aktif ? 'text-brand-300' : 'text-slate-500',
            ]"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="i.aktif ? 'bg-brand-400' : 'bg-slate-600'" />
            {{ i.aktif ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>

        <p class="text-xs text-slate-400 mt-3 line-clamp-3 flex-1">
          {{ i.bio || 'Belum ada bio.' }}
        </p>

        <p class="text-xs text-slate-500 mt-3">
          Memegang <span class="text-slate-300 font-semibold">{{ i.jumlahKelas }}</span> kelas
        </p>

        <div class="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <button class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="busyId === i.id" @click="openEdit(i)">
            Edit
          </button>
          <button class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="busyId === i.id" @click="toggleAktif(i)">
            {{ i.aktif ? 'Nonaktifkan' : 'Aktifkan' }}
          </button>
          <button
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-400/40 transition disabled:opacity-50"
            :disabled="busyId === i.id"
            title="Hapus"
            @click="hapusInstruktur(i)"
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
      :title="editingId ? 'Edit Instruktur' : 'Tambah Instruktur'"
      subtitle="Lengkapi data instruktur di bawah."
      @close="showForm = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Nama instruktur</label>
          <input v-model="form.nama" type="text" required class="input mt-1.5" placeholder="Nama lengkap">
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Spesialisasi</label>
          <input v-model="form.spesialisasi" type="text" required class="input mt-1.5" placeholder="mis. Yoga & Mobility">
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Bio <span class="normal-case text-slate-600">(opsional)</span></label>
          <textarea
            v-model="form.bio"
            rows="3"
            maxlength="400"
            class="input mt-1.5 resize-none"
            placeholder="Pengalaman, sertifikasi, dll."
          />
          <p class="text-[11px] text-slate-600 mt-1 text-right">{{ form.bio.length }}/400</p>
        </div>
        <label class="flex items-center gap-2.5 text-sm text-slate-300">
          <input v-model="form.aktif" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-brand-400">
          Instruktur aktif
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
