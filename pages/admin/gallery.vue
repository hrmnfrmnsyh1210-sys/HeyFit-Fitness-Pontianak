<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth', roles: ['admin', 'owner'] })
useHead({ title: 'Galeri & Berita — Heyfit' })

interface GalleryRow {
  id: number
  judul: string
  kategori: string
  ringkasan: string | null
  konten: string | null
  gambar: string
  tampil: boolean
  createdAt: string
}

const { data, pending, error, refresh } = await useFetch<{ data: GalleryRow[] }>('/api/admin/gallery')

// --- modal form ---
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ judul: '', kategori: 'Berita', ringkasan: '', konten: '', gambar: '', tampil: true })

function openCreate() {
  editingId.value = null
  Object.assign(form, { judul: '', kategori: 'Berita', ringkasan: '', konten: '', gambar: '', tampil: true })
  formError.value = ''
  showForm.value = true
}

function openEdit(g: GalleryRow) {
  editingId.value = g.id
  Object.assign(form, {
    judul: g.judul,
    kategori: g.kategori,
    ringkasan: g.ringkasan ?? '',
    konten: g.konten ?? '',
    gambar: g.gambar,
    tampil: g.tampil,
  })
  formError.value = ''
  showForm.value = true
}

async function submitForm() {
  if (!form.gambar) {
    formError.value = 'Foto wajib diunggah.'
    return
  }
  saving.value = true
  formError.value = ''
  const body = {
    judul: form.judul,
    kategori: form.kategori.trim() || 'Berita',
    ringkasan: form.ringkasan.trim() || null,
    konten: form.konten.trim() || null,
    gambar: form.gambar,
    tampil: form.tampil,
  }
  try {
    if (editingId.value)
      await $fetch(`/api/admin/gallery/${editingId.value}`, { method: 'PATCH', body })
    else
      await $fetch('/api/admin/gallery', { method: 'POST', body })
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

async function toggleTampil(g: GalleryRow) {
  busyId.value = g.id
  try {
    await $fetch(`/api/admin/gallery/${g.id}`, { method: 'PATCH', body: { tampil: !g.tampil } })
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

async function hapusItem(g: GalleryRow) {
  if (!confirm(`Hapus "${g.judul}" dari galeri?`)) return
  busyId.value = g.id
  try {
    await $fetch(`/api/admin/gallery/${g.id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string } }
    alert(err?.data?.statusMessage ?? 'Gagal menghapus item.')
  }
  finally {
    busyId.value = null
  }
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p class="chip mb-3">Manajemen</p>
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white">Galeri &amp; Berita</h1>
        <p class="text-slate-400 mt-1">Kelola foto dan berita seputar Heyfit yang tampil di situs.</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ Tambah Berita</button>
    </div>

    <div v-if="error" class="card p-5 mb-4 border-rose-500/30 bg-rose-500/[0.06]">
      <p class="text-rose-300 text-sm font-semibold">Gagal memuat galeri.</p>
      <p class="text-slate-400 text-xs mt-1">
        Jalankan <code class="text-brand-300">npm run db:migrate-gallery</code> untuk membuat tabelnya.
      </p>
    </div>

    <div v-if="pending" class="card p-16 text-center text-slate-500 text-sm">Memuat…</div>

    <div v-else-if="!data?.data.length" class="card p-16 text-center">
      <p class="text-3xl mb-2">🖼️</p>
      <p class="text-white font-semibold">Belum ada berita</p>
      <p class="text-slate-500 text-sm mt-1">Tambahkan foto/berita pertama untuk mengisi galeri.</p>
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="g in data.data"
        :key="g.id"
        :class="['card overflow-hidden flex flex-col', !g.tampil && 'opacity-60']"
      >
        <div class="relative aspect-[16/10] bg-black/40">
          <img :src="g.gambar" :alt="g.judul" class="absolute inset-0 h-full w-full object-cover">
          <span class="absolute top-2.5 left-2.5 chip bg-ink-950/70 backdrop-blur">{{ g.kategori }}</span>
          <span
            v-if="!g.tampil"
            class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-ink-950/70 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-slate-300"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-slate-500" /> Disembunyikan
          </span>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <p class="text-[11px] text-slate-500">{{ formatTanggal(g.createdAt) }}</p>
          <h3 class="font-display text-base font-bold text-white mt-1 line-clamp-2">{{ g.judul }}</h3>
          <p class="text-xs text-slate-400 mt-2 line-clamp-3 flex-1">
            {{ g.ringkasan || g.konten || 'Tanpa ringkasan.' }}
          </p>

          <div class="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
            <button class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="busyId === g.id" @click="openEdit(g)">
              Edit
            </button>
            <button class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="busyId === g.id" @click="toggleTampil(g)">
              {{ g.tampil ? 'Sembunyikan' : 'Tampilkan' }}
            </button>
            <button
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-400/40 transition disabled:opacity-50"
              :disabled="busyId === g.id"
              title="Hapus"
              @click="hapusItem(g)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- modal -->
    <AdminModal
      v-if="showForm"
      :title="editingId ? 'Edit Berita' : 'Tambah Berita'"
      subtitle="Lengkapi foto dan keterangan berita di bawah."
      @close="showForm = false"
    >
      <form class="space-y-4" @submit.prevent="submitForm">
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Foto</label>
          <GambarUpload
            v-model="form.gambar"
            class="mt-1.5"
            label="Unggah foto berita"
            hint="Klik untuk pilih foto (JPG/PNG)"
          />
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Judul</label>
          <input v-model="form.judul" type="text" required maxlength="160" class="input mt-1.5" placeholder="mis. Grand Opening Cabang Baru">
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Kategori</label>
          <input v-model="form.kategori" type="text" maxlength="60" class="input mt-1.5" placeholder="mis. Berita, Event, Promo">
          <p class="text-[11px] text-slate-600 mt-1">Bebas diisi sesuai kebutuhan. Kosong = "Berita".</p>
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Ringkasan <span class="normal-case text-slate-600">(opsional)</span></label>
          <textarea
            v-model="form.ringkasan"
            rows="2"
            maxlength="300"
            class="input mt-1.5 resize-none"
            placeholder="Kalimat singkat yang tampil di kartu."
          />
          <p class="text-[11px] text-slate-600 mt-1 text-right">{{ form.ringkasan.length }}/300</p>
        </div>
        <div>
          <label class="text-xs uppercase tracking-widest text-slate-500">Isi berita <span class="normal-case text-slate-600">(opsional)</span></label>
          <textarea
            v-model="form.konten"
            rows="4"
            class="input mt-1.5 resize-none"
            placeholder="Tulis isi berita selengkapnya di sini."
          />
        </div>
        <label class="flex items-center gap-2.5 text-sm text-slate-300">
          <input v-model="form.tampil" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-brand-400">
          Tampilkan di situs
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
