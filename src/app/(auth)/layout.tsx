import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TUTTI - 로그인',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-2xl font-black text-indigo-600 tracking-tight">TUTTI</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 space-y-1">
        <div>
          <Link href="/privacy" className="hover:text-gray-600 underline">개인정보처리방침</Link>
        </div>
        <div>© 2026 TUTTI. 클래식 연주자 매칭 플랫폼</div>
      </footer>
    </div>
  )
}
