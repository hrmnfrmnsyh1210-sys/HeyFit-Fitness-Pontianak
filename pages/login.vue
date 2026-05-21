<script setup lang="ts">
useHead({ title: 'Masuk — Heyfit' })

const { loggedIn, user, fetch: refreshSession } = useUserSession()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

function destinationFor(role: 'member' | 'admin' | 'owner') {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) return redirect
  if (role === 'owner') return '/owner'
  if (role === 'admin') return '/admin'
  return '/dashboard'
}

// Kalau sudah login, langsung arahkan keluar dari halaman login.
onMounted(() => {
  if (loggedIn.value && user.value) navigateTo(destinationFor(user.value.role))
})

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    const { user: loggedUser } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    await navigateTo(destinationFor(loggedUser.role))
  }
  catch (err) {
    errorMsg.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal masuk. Coba lagi.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="min-h-[80vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2 mb-6">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-400 text-ink-950 font-display font-extrabold shadow-glow">H</span>
          <span class="font-display text-xl font-extrabold text-white">Hey<span class="text-brand-400">fit</span></span>
        </NuxtLink>
        <h1 class="font-display text-3xl font-extrabold text-white">Selamat datang kembali</h1>
        <p class="text-slate-400 mt-1 text-sm">Masuk untuk lanjut latihan.</p>
      </div>

      <form class="card p-7 space-y-5" @submit.prevent="handleLogin">
        <div
          v-if="errorMsg"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="kamu@email.com"
            class="input"
          >
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="input"
          >
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="!loading">Masuk</span>
          <span v-else>Memproses…</span>
        </button>

        <p class="text-sm text-center text-slate-400">
          Belum punya akun?
          <NuxtLink to="/register" class="text-brand-300 font-semibold hover:underline">Daftar member</NuxtLink>
        </p>
      </form>

      <p class="mt-6 text-center text-xs text-slate-600">
        Akun staff (admin/owner) dibuat lewat seed script, bukan registrasi.
      </p>
    </div>
  </section>
</template>
