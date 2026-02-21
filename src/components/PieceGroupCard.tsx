import Link from 'next/link'

const INK = '#1a1a1a'
const ACCENT = '#b8860b'
const WARM_WHITE = '#fffef9'

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

export default function PieceGroupCard({ piece }: { piece: PieceGroup }) {
  const firstGigHref = piece.teams.length > 0 ? `/gigs/${piece.teams[0].gig_id}` : '/gigs'

  return (
    <div style={{
      backgroundColor: WARM_WHITE,
      borderRadius: '16px',
      border: '1px solid #f0ebe3',
      padding: '16px',
      position: 'relative',
    }}>
      {/* Composer */}
      {(piece.composer_name_ko || piece.composer_name_en) && (
        <p style={{ fontSize: '12px', color: ACCENT, fontWeight: 600, marginBottom: '2px' }}>
          {piece.composer_name_ko || ''}
          {piece.composer_name_en ? ` (${piece.composer_name_en})` : ''}
        </p>
      )}

      {/* Piece title — links to first gig */}
      <Link href={firstGigHref} style={{ textDecoration: 'none' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: INK, lineHeight: 1.4, marginBottom: '8px' }}>
          {piece.piece_title}
        </h3>
      </Link>

      {/* Team count */}
      <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
        {piece.team_count}개 팀 모집 중
      </p>

      {/* Team list */}
      {piece.teams.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {piece.teams.map((team, i) => {
            const isLast = i === piece.teams.length - 1
            const prefix = isLast ? '└─' : '├─'
            return (
              <Link key={team.gig_id} href={`/gigs/${team.gig_id}`} style={{ textDecoration: 'none' }}>
                <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
                  <span style={{ color: '#ccc', marginRight: '4px' }}>{prefix}</span>
                  {team.author_name || '익명'}
                  {team.region_name && (
                    <span style={{ color: '#bbb' }}> · {team.region_name}</span>
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
