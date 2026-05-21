// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],
  runtimeConfig: {
    session: {
      // Session bertahan 7 hari.
      maxAge: 60 * 60 * 24 * 7,
      cookie: {
        // Di dev (http://localhost) cookie 'secure' tidak terkirim;
        // di production (https) tetap secure.
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Heyfit Fitness',
      htmlAttrs: { lang: 'id', class: 'dark' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Heyfit Fitness Pontianak — keanggotaan, kelas, dan fasilitas gym modern' },
        { name: 'theme-color', content: '#05060a' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap',
        },
      ],
    },
  },
})
