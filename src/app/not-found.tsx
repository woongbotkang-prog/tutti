import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl mb-4">🎵</p>
      <h2 className="text-xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없어요</h2>
      <p className="text-sm text-gray-500 mb-6">요청하신 페이지가 존재하지 않아요.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink-light transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
