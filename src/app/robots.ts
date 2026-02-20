import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tutti.music'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/chat/', '/profile', '/onboarding', '/notifications'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
