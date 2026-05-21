<script setup lang="ts">
const { loggedIn, user, clear: clearSession } = useUserSession()

const memberLinks = [
  { to: '/', label: 'Home' },
  { to: '/kelas', label: 'Kelas' },
  { to: '/fasilitas', label: 'Fasilitas' },
  { to: '/keanggotaan/daftar', label: 'Daftar Member' },
]

// Link staff tampil sesuai role: owner melihat semua, admin melihat Admin.
const staffLinks = computed(() => {
  const role = user.value?.role
  const links: { to: string, label: string }[] = []
  if (role === 'admin' || role === 'owner') {
    links.push({ to: '/admin', label: 'Admin' })
    links.push({ to: '/admin/scan', label: 'Scan QR' })
  }
  if (role === 'owner') links.push({ to: '/owner', label: 'Owner' })
  return links
})

const roleLabel: Record<string, string> = {
  member: 'Member',
  admin: 'Admin',
  owner: 'Owner',
}

const mobileOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => {
  mobileOpen.value = false
})

async function handleLogout() {
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="relative min-h-screen flex flex-col overflow-x-hidden">
    <!-- ambient background -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10">
      <div class="absolute inset-0 grid-bg opacity-[0.4]" />
      <div class="absolute inset-0 bg-grid-fade" />
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand-500/15 blur-3xl" />
      <div class="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-accent-500/10 blur-3xl" />
    </div>

    <!-- header — fixed (tidak bergerak) & dominan cyan -->
    <header class="fixed top-0 inset-x-0 z-40 border-b border-brand-400/25 bg-gradient-to-r from-brand-950/95 via-brand-800/90 to-brand-950/95 backdrop-blur-xl shadow-[0_12px_40px_-14px_rgba(6,182,212,0.55)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Heyfit Fitness"
            class="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_0_14px_rgba(34,211,238,0.4)]"
          >
          <span class="font-display text-lg font-extrabold tracking-tight text-white">
            Hey<span class="text-brand-400">fit</span>
          </span>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1 text-sm ml-4">
          <NuxtLink
            v-for="link in memberLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 rounded-lg text-brand-100/75 hover:text-white hover:bg-white/[0.08] transition"
            active-class="!text-white bg-brand-400/15"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <!-- staff links -->
          <nav v-if="staffLinks.length" class="hidden lg:flex items-center gap-1 text-xs mr-1">
            <NuxtLink
              v-for="link in staffLinks"
              :key="link.to"
              :to="link.to"
              class="px-2.5 py-1.5 rounded-md text-brand-200/65 hover:text-white transition"
              active-class="!text-white"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <!-- logged in -->
          <template v-if="loggedIn && user">
            <NuxtLink
              to="/dashboard"
              class="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 hover:border-brand-400/50 transition"
              active-class="!border-brand-400/60"
            >
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 text-xs font-bold">
                {{ user.nama.charAt(0).toUpperCase() }}
              </span>
              <span class="text-xs">
                <span class="text-white font-semibold">{{ user.nama.split(' ')[0] }}</span>
                <span class="text-slate-500"> · {{ roleLabel[user.role] }}</span>
              </span>
            </NuxtLink>
            <button class="btn-ghost !py-2 !px-3.5 text-xs" @click="handleLogout">
              Keluar
            </button>
          </template>

          <!-- logged out -->
          <template v-else>
            <NuxtLink to="/login" class="hidden sm:inline-flex btn-ghost !py-2 !px-4 text-xs">
              Masuk
            </NuxtLink>
            <NuxtLink to="/register" class="hidden sm:inline-flex btn-primary !py-2">
              Join Now
              <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
            </NuxtLink>
          </template>

          <button
            class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-brand-400/30 text-white hover:bg-white/[0.08] transition"
            aria-label="Menu"
            @click="mobileOpen = !mobileOpen"
          >
            <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- mobile drawer -->
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileOpen" class="md:hidden border-t border-brand-400/15 bg-gradient-to-b from-brand-950/97 to-brand-900/95 backdrop-blur-xl">
          <div class="px-4 py-4 space-y-1">
            <NuxtLink
              v-for="link in memberLinks"
              :key="link.to"
              :to="link.to"
              class="block px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.04]"
              active-class="!text-brand-300 bg-white/[0.04]"
            >
              {{ link.label }}
            </NuxtLink>

            <div v-if="staffLinks.length" class="pt-3 mt-3 border-t border-white/[0.06]">
              <p class="px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500">Staff</p>
              <NuxtLink
                v-for="link in staffLinks"
                :key="link.to"
                :to="link.to"
                class="block px-3 py-2 rounded-lg text-slate-400 hover:text-brand-300"
                active-class="!text-brand-300"
              >
                {{ link.label }}
              </NuxtLink>
            </div>

            <div class="pt-3 mt-3 border-t border-white/[0.06]">
              <template v-if="loggedIn && user">
                <p class="px-3 py-1 text-xs text-slate-400">
                  Masuk sebagai <span class="text-white font-semibold">{{ user.nama }}</span> ({{ roleLabel[user.role] }})
                </p>
                <NuxtLink
                  to="/dashboard"
                  class="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  active-class="!text-brand-300 bg-white/[0.04]"
                >
                  Dashboard
                </NuxtLink>
                <button
                  class="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-white/[0.04]"
                  @click="handleLogout"
                >
                  Keluar
                </button>
              </template>
              <template v-else>
                <NuxtLink to="/login" class="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.04]">
                  Masuk
                </NuxtLink>
                <NuxtLink to="/register" class="block px-3 py-2 rounded-lg text-brand-300 font-semibold hover:bg-white/[0.04]">
                  Daftar Member
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <main class="flex-1 pt-16">
      <slot />
    </main>

    <footer class="mt-24 border-t border-white/[0.06] bg-ink-950/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div class="flex items-center gap-2.5 mb-3">
            <img src="/logo.png" alt="Heyfit Fitness" class="h-9 w-9 object-contain">
            <span class="font-display text-base font-extrabold text-white">Hey<span class="text-brand-400">fit</span> <span class="text-accent-300">Fitness</span></span>
          </div>
          <p class="text-slate-500 max-w-xs">Train hard. Recover smart. Komunitas fitness modern dengan kelas dan fasilitas lengkap di Pontianak.</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-widest text-slate-500 mb-3">Eksplor</p>
          <ul class="space-y-2 text-slate-400">
            <li><NuxtLink to="/kelas" class="hover:text-brand-300">Kelas</NuxtLink></li>
            <li><NuxtLink to="/fasilitas" class="hover:text-brand-300">Fasilitas</NuxtLink></li>
            <li><NuxtLink to="/keanggotaan/perpanjang" class="hover:text-brand-300">Perpanjang Member</NuxtLink></li>
          </ul>
        </div>
        <div>
          <p class="text-xs uppercase tracking-widest text-slate-500 mb-3">Kontak</p>
          <ul class="space-y-2 text-slate-400">
            <li>halo@heyfit.id</li>
            <li>+62 812-3456-7890</li>
            <li>Pontianak, Kalimantan Barat</li>
            <li>
              <a
                href="https://www.instagram.com/heyfitness.pontianak/"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 hover:text-brand-300 transition"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>
                @heyfitness.pontianak
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/[0.06]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>&copy; {{ new Date().getFullYear() }} Heyfit Fitness. All rights reserved.</p>
          <p class="flex items-center gap-2"><span class="glow-dot" /> System operational</p>
        </div>
      </div>
    </footer>
  </div>
</template>
