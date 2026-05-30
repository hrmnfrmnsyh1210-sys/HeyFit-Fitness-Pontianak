<script setup lang="ts">
/**
 * Input unggah satu gambar (mis. foto galeri/berita). Gambar dikompres di
 * sisi klien (maks 1600px, JPEG) lalu di-emit sebagai data URL base64 —
 * siap dikirim ke API tanpa storage file terpisah.
 */
const props = withDefaults(defineProps<{ modelValue: string, label?: string, hint?: string }>(), {
  label: 'Unggah gambar',
  hint: 'Klik untuk pilih foto (JPG/PNG)',
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const processing = ref(false)
const error = ref('')

function pickFile() {
  inputRef.value?.click()
}

async function onFileChange(e: Event) {
  error.value = ''
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = 'File harus berupa gambar (JPG/PNG).'
    return
  }
  processing.value = true
  try {
    emit('update:modelValue', await compressImage(file))
  }
  catch {
    error.value = 'Gagal memproses gambar. Coba file lain.'
  }
  finally {
    processing.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}

function hapus() {
  emit('update:modelValue', '')
  error.value = ''
}

/** Baca file, perkecil ke maks 1600px, ekspor JPEG terkompresi. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('decode'))
      img.onload = () => {
        const maxDim = 1600
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
</script>

<template>
  <div>
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    >

    <!-- belum ada gambar -->
    <button
      v-if="!props.modelValue"
      type="button"
      :disabled="processing"
      class="w-full rounded-xl border-2 border-dashed border-white/15 hover:border-brand-400/50 bg-white/[0.02] px-4 py-8 text-center transition disabled:opacity-60"
      @click="pickFile"
    >
      <svg class="w-8 h-8 mx-auto text-slate-500" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
      </svg>
      <p class="mt-2 text-sm font-medium text-white">
        {{ processing ? 'Memproses gambar…' : label }}
      </p>
      <p class="text-xs text-slate-500 mt-0.5">{{ hint }}</p>
    </button>

    <!-- preview -->
    <div v-else class="rounded-xl border border-white/10 bg-ink-950/60 p-3">
      <div class="relative rounded-lg overflow-hidden bg-black/40">
        <img :src="props.modelValue" alt="Pratinjau gambar" class="w-full max-h-64 object-contain">
      </div>
      <div class="mt-3 flex gap-2">
        <button type="button" class="btn-ghost !py-1.5 !px-3 text-xs flex-1" :disabled="processing" @click="pickFile">
          Ganti gambar
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 text-xs font-semibold transition"
          @click="hapus"
        >
          Hapus
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-2 text-xs text-rose-400">{{ error }}</p>
  </div>
</template>
