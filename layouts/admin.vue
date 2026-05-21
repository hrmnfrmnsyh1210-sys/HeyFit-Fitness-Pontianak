<script setup lang="ts">
/** Layout console admin — sidebar tetap di kiri, drawer di mobile. */
const route = useRoute()
const mobileOpen = ref(false)

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div class="relative min-h-screen text-slate-200">
    <!-- ambient background -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
      <div class="absolute inset-0 grid-bg opacity-[0.25]" />
      <div class="absolute -top-32 left-1/3 h-[380px] w-[680px] rounded-full bg-brand-500/10 blur-3xl" />
    </div>

    <!-- sidebar desktop -->
    <aside class="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 border-r border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <AdminSidebar />
    </aside>

    <!-- topbar mobile -->
    <header class="lg:hidden sticky top-0 z-40 flex items-center gap-3 h-16 px-4 border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Buka menu"
        class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200"
        @click="mobileOpen = true"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <NuxtLink to="/admin" class="flex items-center gap-2">
        <img src="/logo.png" alt="Heyfit Fitness" class="h-8 w-8 object-contain">
        <span class="font-display text-base font-extrabold text-white">Hey<span class="text-brand-400">fit</span></span>
      </NuxtLink>
      <span class="chip ml-auto">Admin Console</span>
    </header>

    <!-- drawer mobile -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileOpen" class="lg:hidden fixed inset-0 z-50">
        <div class="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" @click="mobileOpen = false" />
        <Transition
          appear
          enter-active-class="transition duration-200"
          enter-from-class="-translate-x-full"
          leave-active-class="transition duration-150"
          leave-to-class="-translate-x-full"
        >
          <aside v-if="mobileOpen" class="absolute inset-y-0 left-0 w-72 bg-ink-950 border-r border-white/[0.06]">
            <AdminSidebar />
          </aside>
        </Transition>
      </div>
    </Transition>

    <!-- konten -->
    <div class="lg:pl-64">
      <slot />
    </div>
  </div>
</template>
