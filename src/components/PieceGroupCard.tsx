import Link from 'next/link'

interface Team {
  gig_id: string
  gig_title: string
  author_name: string | null
  region_name: string | null
}

interface PieceGroup {
  piece_id: string
  piece_title: string
  composer_name_ko: string | null
  composer_name_en: string | null
  period: string | null
  team_count: number
  teams: Team[]
}

const periodKo: Record<string, string> = {
  baroque: '바로크',
  classical: '고전',
  romantic: '낭만',
  modern: '근현대',
  contemporary: '현대',
}

export default function PieceGroupCard({ piece }: { piece: PieceGroup }) {
  const firstGigHref = piece.teams.length > 0 ? `/gigs/${piece.teams[0].gig_id}` : '/gigs'

  return (
    <div className="bg-warm-white rounded-2xl border border-[#f0ebe3] p-4 relative">
      {/* 작곡가 + 시대 태그 */}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {(piece.composer_name_ko || piece.composer_name_en) && (
          <p className="text-xs text-accent font-semibold">
            {piece.composer_name_ko || ''}
            {piece.composer_name_en ? ` (${piece.composer_name_en})` : ''}
          </p>
        )}
        {piece.period && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5eedf] text-[#8a7650] font-medium">
            #{periodKo[piece.period] || piece.period}
          </span>
        )}
      </div>

      {/* 곡 제목 — 첫 번째 공고로 링크 */}
      <Link href={firstGigHref}>
        <h3 className="text-base font-bold text-ink leading-snug mb-2">
          {piece.piece_title}
        </h3>
      </Link>

      {/* 모집 팀 수 */}
      <p className="text-xs text-gray-400 mb-2">
        {piece.team_count}개 팀 모집 중
      </p>

      {/* 팀 목록 */}
      {piece.teams.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {piece.teams.map((team, i) => {
            const isLast = i === piece.teams.length - 1
            const prefix = isLast ? '└─' : '├─'
            return (
              <Link key={team.gig_id} href={`/gigs/${team.gig_id}`}>
                <p className="text-xs text-[#666] leading-relaxed">
                  <span className="text-[#ccc] mr-1">{prefix}</span>
                  {team.author_name || '익명'}
                  {team.region_name && (
                    <span className="text-[#bbb]"> · {team.region_name}</span>
                  )}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
