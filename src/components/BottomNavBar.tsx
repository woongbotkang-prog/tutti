'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, FileText, MessageCircle, Bell, User } from 'lucide-react'
import { fetchUnreadNotificationCount, fetchUnreadChatCount } from '@/lib/supabase/queries'

interface NavItem {
  icon: typeof Search
  label: string
  href: string
  matchPrefix: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home,          label: '홈',       href: '/',              matchPrefix: '/' },
  { icon: Search,        label: '공고',     href: '/gigs',          matchPrefix: '/gigs' },
  { icon: MessageCircle, label: '채팅',     href: '/chat',          matchPrefix: '/chat' },
  { icon: Bell,          label: '알림',     href: '/notifications', matchPrefix: '/notifications' },
  { icon: User,          label: '프로필',   href: '/profile',       matchPrefix: '/profile' },
]

/** BottomNavBar를 숨겨야 하는 경로 패턴 */
const HIDE_PATTERNS = [
  /^\/gigs\/new$/,           // 공고 작성
  /^\/gigs\/[^/]+\/apply$/,  // 지원 폼
  /^\/gigs\/[^/]+\/edit$/,   // 공고 수정
  /^\/chat\/[^/]+$/,         // 채팅방 내부
]

function shouldHideNav(pathname: string): boolean {
  return HIDE_PATTERNS.some(pattern => pattern.test(pathname))
}

function isActive(pathname: string, matchPrefix: string): boolean {
  if (matchPrefix === '/') {
    return pathname === '/'
  }
  if (matchPrefix === '/gigs') {
    return pathname === '/gigs' || pathname.startsWith('/gigs/')
  }
  if (matchPrefix === '/chat') {
    return pathname === '/chat' || pathname.startsWith('/chat/')
  }
  return pathname.startsWith(matchPrefix)
}

export default function BottomNavBar() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [notifCount, chatCount] = await Promise.all([
          fetchUnreadNotificationCount(),
          fetchUnreadChatCount(),
        ])
        if (mounted) {
          setUnreadCount(notifCount)
          setUnreadChatCount(chatCount)
        }
      } catch {
        // 로그인 안 됐거나 에러 → 무시
      }
    }
    load()

    // 30초마다 갱신
    const interval = setInterval(load, 30_000)
    return () => { mounted = false; clearInterval(interval) }
  }, [pathname]) // pathname 변경 시에도 재로드

  if (shouldHideNav(pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-inset-bottom" role="navigation" aria-label="메인 메뉴">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.matchPrefix)
          const isNotification = item.href === '/notifications'
          const isChat = item.href === '/chat'

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2.5 transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isChat && unreadChatCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
