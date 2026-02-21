'use client'

import Link from 'next/link'

interface GigCard {
  piece_id: string
  piece_title: string
  composer_name_ko: string | null
  composer_name_en: string | null
  team_count: number
  teams: { gig_id: string }[]
}

interface ScrollingGigCardsProps {
  cards: GigCard[]
}

export default function ScrollingGigCards({ cards }: ScrollingGigCardsProps) {
  if (cards.length === 0) return null

  const doubled = [...cards, ...cards]

  return (
    <div
      className="overflow-hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 30s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-track:hover,
        .marquee-track:focus-within {
          animation-play-state: paused;
        }
        @media (hover: none) {
          .marquee-track:active {
            animation-play-state: paused;
          }
        }
      `}</style>
      <div className="marquee-track gap-3 flex">
        {doubled.map((card, i) => {
          const href = card.teams?.[0]?.gig_id
            ? `/gigs/${card.teams[0].gig_id}`
            : '/gigs'
          return (
            <Link
              key={`${card.piece_id}-${i}`}
              href={href}
              className="shrink-0 w-[220px] block"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm h-full">
                <p className="text-xs text-[#b8860b] font-medium truncate">
                  {card.composer_name_ko || card.composer_name_en || ''}
                </p>
                <p className="font-bold text-sm mt-1 line-clamp-2 text-[#1a1a1a]">
                  {card.piece_title}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {card.team_count}개 팀 모집 중
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
