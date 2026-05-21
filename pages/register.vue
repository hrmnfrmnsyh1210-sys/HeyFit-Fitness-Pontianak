<script setup lang="ts">
useHead({ title: 'Daftar Akun — Heyfit' })

const { loggedIn, fetch: refreshSession } = useUserSession()

const nama = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

onMounted(() => {
  if (loggedIn.value) navigateTo('/')
})

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { nama: nama.value, email: email.value, password: password.value },
    })
    await refreshSession()
    await navigateTo('/dashboard')
  }
  catch (err) {
    errorMsg.value = (err as { statusMessage?: string })?.statusMessage ?? 'Gagal mendaftar. Coba lagi.'
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
        <h1 class="font-display text-3xl font-extrabold text-white">Buat akun member</h1>
        <p class="text-slate-400 mt-1 text-sm">Gratis. Cukup 30 detik.</p>
      </div>

      <form class="card p-7 space-y-5" @submit.prevent="handleRegister">
        <div
          v-if="errorMsg"
          class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Nama lengkap</label>
          <input v-model="nama" required autocomplete="name" placeholder="Mis. Andi Saputra" class="input">
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Email</label>
          <input v-model="email" type="email" required autocomplete="email" placeholder="kamu@email.com" class="input">
        </div>

        <div>
          <label class="block text-xs uppercase tracking-widest text-slate-500 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
            placeholder="Minimal 6 karakter"
            class="input"
          >
        </div>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <span v-if="!loading">Daftar Sekarang</span>
          <span v-else>Memproses…</span>
        </button>

        <p class="text-sm text-center text-slate-400">
          Sudah punya akun?
          <NuxtLink to="/login" class="text-brand-300 font-semibold hover:underline">Masuk</NuxtLink>
        </p>
      </form>
    </div>
  </section>
</template>
