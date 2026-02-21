'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface HomeSearchBarProps {
  popularComposers: { name_ko: string; name_en: string }[]
}

export default function HomeSearchBar({ popularComposers }: HomeSearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/gigs?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleTagClick = (composerName: string) => {
    router.push(`/gigs?search=${encodeURIComponent(composerName)}`)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="곡이나 작곡가를 검색하세요"
          className="w-full h-12 rounded-xl border-[1.5px] border-[#e5e0d8] bg-warm-white px-4 pr-12 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 w-10 h-10 rounded-[10px] bg-ink text-warm-white flex items-center justify-center hover:bg-ink/80 transition-colors"
          aria-label="검색"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {popularComposers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400 self-center">인기</span>
          {popularComposers.map((c) => (
            <button
              key={c.name_en}
              onClick={() => handleTagClick(c.name_ko || c.name_en)}
              className="text-xs px-3 py-1 rounded-full border border-[#e5e0d8] bg-warm-white text-ink hover:bg-accent hover:text-warm-white hover:border-accent transition-all"
            >
              {c.name_ko || c.name_en}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
