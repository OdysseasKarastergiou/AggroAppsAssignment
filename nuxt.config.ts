import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Leaflet, geolocation and sessionStorage are browser-only, so the app runs as an SPA.
  ssr: false,

  css: ['leaflet/dist/leaflet.css', '~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['leaflet'],
    },
  },

  app: {
    head: {
      title: 'Weather Explorer',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Explore the weather anywhere in the world.' },
      ],
      link: [
        {
          rel: 'icon',
          href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌦️</text></svg>',
        },
      ],
    },
  },
})
