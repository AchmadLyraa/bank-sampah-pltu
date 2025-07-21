import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bank Sampah PLN Indonesia",
    short_name: "Bank Sampah",
    description: "Sistem manajemen bank sampah untuk PLN Indonesia",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "id",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon/favicon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        "purpose":"maskable",
        "sizes":"512x512",
        "src":"/favicon/android-chrome-512x512.png",
        "type":"image/png"
      },
      {
        "purpose":"any",
        "sizes":"512x512",
        "src":"/favicon/android-chrome-512x512.png",
        "type":"image/png"
      }
    ],
    screenshots: [
      {
        src: '/screenshots/placeholder.jpg',
        sizes: '1366x641',
        type: 'image/png',
      },
      // Opsional: Screenshot untuk mobile
      {
        src: '/screenshots/placeholder.jpg',
        sizes: '674x1280',
        type: 'image/png',
      }
    ],
  }
}
