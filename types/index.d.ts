/**
 * Type augmentation untuk auth.
 */

// Bentuk data user yang disimpan di session cookie (nuxt-auth-utils).
declare module '#auth-utils' {
  interface User {
    id: number
    nama: string
    email: string
    role: 'member' | 'admin' | 'owner'
  }
}

// Meta tambahan pada page: `definePageMeta({ roles: ['admin'] })`.
declare module 'vue-router' {
  interface RouteMeta {
    roles?: ('member' | 'admin' | 'owner')[]
  }
}

export {}
