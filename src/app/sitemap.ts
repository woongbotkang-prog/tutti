import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch active gig IDs
  const { data: gigs = [] } = await supabase
    .from('gigs')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1000)

  // Fetch piece IDs
  const { data: pieces = [] } = await supabase
    .from('pieces')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1000)

  const baseUrl = 'https://tutti.music'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/gigs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/musicians`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Dynamic gig routes
  const gigRoutes: MetadataRoute.Sitemap = (gigs || []).map((gig: any) => ({
    url: `${baseUrl}/gigs/${gig.id}`,
    lastModified: new Date(gig.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Dynamic piece routes
  const pieceRoutes: MetadataRoute.Sitemap = (pieces || []).map((piece: any) => ({
    url: `${baseUrl}/pieces/${piece.id}`,
    lastModified: new Date(piece.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...gigRoutes, ...pieceRoutes]
}
