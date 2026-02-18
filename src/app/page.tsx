import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Home, Search, MessageCircle, User } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* 헤더 */}
      <header className="px-6 py-4 flex items-center justify-between max-w-lg mx-auto">
        <span className="text-2xl font-black text-indigo-600 tracking-tight">TUTTI</span>
        {user ? (
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              나
            </div>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        )}
      </header>

      {/* 히어로 */}
      <section className="px-6 pt-8 pb-10 max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          클래식 연주자들의<br />
          <span className="text-indigo-600">매칭 플랫폼</span>
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          오케스트라 단원을 구하거나, 함께 연주할 팀을 찾아보세요
        </p>
        {!user && (
          <div className="flex gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                시작하기
              </Button>
            </Link>
            <Link href="/gigs">
              <Button size="lg" variant="outline">
                공고 보기
              </Button>
            </Link>
          </div>
        )}
        {user && (
          <div className="flex gap-3 justify-center">
            <Link href="/gigs/new">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                공고 올리기
              </Button>
            </Link>
            <Link href="/gigs">
              <Button size="lg" variant="outline">
                공고 찾기
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 빠른 바로가기 */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/gigs?type=hiring" className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-3xl mb-2 block">🎻</span>
            <p className="font-bold text-gray-900 text-sm">구인 공고</p>
            <p className="text-xs text-gray-500 mt-1">단원을 찾고 있어요</p>
          </Link>
          <Link href="/gigs?type=seeking" className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-3xl mb-2 block">🎼</span>
            <p className="font-bold text-gray-900 text-sm">구직 공고</p>
            <p className="text-xs text-gray-500 mt-1">팀을 찾고 있어요</p>
          </Link>
        </div>
      </section>

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex">
          {[
            { icon: Home, label: '홈', href: '/', active: true },
            { icon: Search, label: '탐색', href: '/gigs', active: false },
            { icon: MessageCircle, label: '채팅', href: '/chat', active: false },
            { icon: User, label: '내 정보', href: '/profile', active: false },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center py-3 transition-colors ${item.active ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
