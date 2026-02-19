'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/supabase/queries'
import type { NotificationType } from '@/types'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

const NOTIFICATION_ICONS: Record<string, string> = {
  application_received: '📩',
  application_accepted: '✅',
  application_rejected: '❌',
  new_message: '💬',
  gig_expiring: '⏰',
  review_request: '⭐',
  system: '📢',
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyNotifications()
        setNotifications(data as NotificationItem[])
      } catch (e) {
        console.error('알림 불러오기 실패:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id)
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        )
      } catch (e) {
        console.error(e)
      }
    }

    // 알림 타입에 따라 이동
    const data = notification.data
    if (data?.gig_id) {
      router.push(`/gigs/${data.gig_id}`)
    } else if (data?.room_id) {
      router.push(`/chat/${data.room_id}`)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (e) {
      console.error(e)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
        <h1 className="text-lg font-black text-gray-900">알림</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            모두 읽음
          </button>
        )}
      </header>

      <main className="max-w-lg mx-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-4xl mb-3">🔔</span>
            <p className="text-sm">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-indigo-50/50' : 'bg-white'
                }`}
              >
                <span className="text-xl mt-0.5 flex-shrink-0">
                  {NOTIFICATION_ICONS[notification.type] || '📢'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.created_at)}</p>
                </div>
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
