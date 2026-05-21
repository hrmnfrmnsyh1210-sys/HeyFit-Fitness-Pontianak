<script setup lang="ts">
/** Isi sidebar admin — dipakai di versi desktop & drawer mobile. */
const { user, clear: clearSession } = useUserSession()
const route = useRoute()

interface NavLink { to: string, label: string, icon: string, exact?: boolean }

const icons: Record<string, string> = {
  grid: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z',
  users: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  check: 'M9 12.75l2.25 2.25 4.5-6m4.5 3a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  instruktur: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0A8.966 8.966 0 0021 12a9 9 0 10-18 0c0 2.227.809 4.265 2.082 5.853m11.963 0A8.965 8.965 0 0112 21a8.965 8.965 0 01-5.913-2.222M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
  scan: 'M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M12 9a3 3 0 100 6 3 3 0 000-6z',
  cash: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  back: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  owner: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
}

const nav: NavLink[] = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', exact: true },
  { to: '/admin/members', label: 'Member', icon: 'users' },
  { to: '/admin/payments', label: 'Pembayaran', icon: 'cash' },
  { to: '/admin/attendances', label: 'Kehadiran', icon: 'check' },
  { to: '/admin/classes', label: 'Kelas', icon: 'calendar' },
  { to: '/admin/instructors', label: 'Instruktur', icon: 'instruktur' },
  { to: '/admin/scan', label: 'Scan QR', icon: 'scan' },
]

const roleLabel: Record<string, string> = { member: 'Member', admin: 'Admin', owner: 'Owner' }

function isActive(link: NavLink) {
  return link.exact ? route.path === link.to : route.path.startsWith(link.to)
}

async function handleLogout() {
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- brand -->
    <div class="h-16 flex items-center px-5 border-b border-white/[0.06] shrink-0">
      <NuxtLink to="/admin" class="flex items-center gap-2">
        <img src="/logo.png" alt="Heyfit Fitness" class="h-9 w-9 object-contain">
        <span class="font-display text-lg font-extrabold tracking-tight text-white">
          Hey<span class="text-brand-400">fit</span>
        </span>
        <span class="chip ml-1">Admin</span>
      </NuxtLink>
    </div>

    <!-- nav -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <p class="px-3 pb-2 text-[10px] uppercase tracking-widest text-slate-600">Menu</p>
      <div class="space-y-1">
        <NuxtLink
          v-for="link in nav"
          :key="link.to"
          :to="link.to"
          :class="[
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition border',
            isActive(link)
              ? 'bg-brand-400/10 text-brand-300 border-brand-400/20'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-white/[0.04]',
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons[link.icon]" />
          </svg>
          {{ link.label }}
        </NuxtLink>
      </div>

      <div class="pt-3 mt-3 border-t border-white/[0.06] space-y-1">
        <NuxtLink
          v-if="user?.role === 'owner'"
          to="/owner"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons.owner" />
          </svg>
          Owner Dashboard
        </NuxtLink>
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons.back" />
          </svg>
          Kembali ke situs
        </NuxtLink>
      </div>
    </nav>

    <!-- user card -->
    <div class="border-t border-white/[0.06] p-3 shrink-0">
      <div class="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-ink-950 font-bold text-sm shrink-0">
          {{ user?.nama?.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-white truncate">{{ user?.nama }}</p>
          <p class="text-xs text-slate-500 truncate">{{ roleLabel[user?.role ?? ''] ?? user?.role }}</p>
        </div>
        <button
          type="button"
          title="Keluar"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-400/40 transition"
          @click="handleLogout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
