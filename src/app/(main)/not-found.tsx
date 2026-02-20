import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🎵</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나<br />
          이동되었을 수 있습니다.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/gigs"
            className="px-6 py-3 border-2 border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            공고 둘러보기
          </Link>
        </div>
      </div>
    </div>
  )
}
