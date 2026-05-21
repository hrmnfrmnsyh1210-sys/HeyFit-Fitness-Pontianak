<script setup lang="ts">
/** Modal sederhana untuk form admin (tambah/edit). */
defineProps<{ title: string, subtitle?: string }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" @click="$emit('close')" />
    <div class="relative w-full max-w-lg card p-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 class="font-display text-lg font-bold text-white">{{ title }}</h2>
          <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition"
          @click="$emit('close')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>
