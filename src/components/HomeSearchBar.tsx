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
          placeholder="작곡가, 시대, 곡명 검색..."
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '12px',
            border: '1.5px solid #e5e0d8',
            backgroundColor: '#fffef9',
            padding: '0 48px 0 16px',
            fontSize: '14px',
            color: '#1a1a1a',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#b8860b'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e0d8'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: '4px',
            top: '4px',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#1a1a1a',
            color: '#fffef9',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="검색"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {popularComposers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: '#999', alignSelf: 'center' }}>인기</span>
          {popularComposers.map((c) => (
            <button
              key={c.name_en}
              onClick={() => handleTagClick(c.name_ko || c.name_en)}
              style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid #e5e0d8',
                backgroundColor: '#fffef9',
                color: '#1a1a1a',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b8860b'
                e.currentTarget.style.color = '#fffef9'
                e.currentTarget.style.borderColor = '#b8860b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fffef9'
                e.currentTarget.style.color = '#1a1a1a'
                e.currentTarget.style.borderColor = '#e5e0d8'
              }}
            >
              {c.name_ko || c.name_en}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
