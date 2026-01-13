import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'BetterRoots Garden Care',
        short_name: 'BetterRoots',
        description: 'Expert plant care schedules and weather alerts.',
        start_url: '/',
        display: 'standalone',
        background_color: '#162E20', // Deep Jungle Green
        theme_color: '#D4F482', // Lime Green
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
