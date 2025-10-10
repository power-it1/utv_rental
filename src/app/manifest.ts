import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adventure Rentals',
    short_name: 'Adventure',
    description: 'Motorcycle, UTV, and coastal guided tour rentals.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F4FEFF',
    theme_color: '#0E7C86',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/pwa-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
