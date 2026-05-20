/**
 * Route middleware untuk proteksi halaman.
 *
 * Pakai di page:
 *   definePageMeta({ middleware: 'auth' })                  // wajib login
 *   definePageMeta({ middleware: 'auth', roles: ['admin'] }) // login + role
 */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const allowed = to.meta.roles
  if (allowed && allowed.length && !allowed.includes(user.value!.role)) {
    // Sudah login tapi role tidak sesuai — lempar ke beranda.
    return navigateTo('/')
  }
})
