'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
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

type CategoryTab = 'all' | 'application' | 'message' | 'system'

const NOTIFICATION_ICONS: Record<string, string> = {
  application_received: '📩',
  application_accepted: '✅',
  application_rejected: '❌',
  new_message: '💬',
  gig_expiring: '⏰',
  review_request: '⭐',
  system: '📢',
}

const CATEGORY_TABS: { key: CategoryTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'application', label: '지원' },
  { key: 'message', label: '메시지' },
  { key: 'system', label: '시스템' },
]

function getCategoryFromType(type: NotificationType): CategoryTab {
  if (type.startsWith('application_')) return 'application'
  if (type === 'new_message') return 'message'
  if (type === 'system' || type === 'gig_expiring') return 'system'
  return 'all'
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

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = today.getTime() - notifDate.getTime()
  const days = diff / (1000 * 60 * 60 * 24)

  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return '이번 주'
  return '이전'
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all')
  const realtimeSubscribed = useRef(false)

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

  // Setup Realtime subscription for new notifications
  useEffect(() => {
    if (realtimeSubscribed.current) return

    let mounted = true
    let channel: any = null

    const setupRealtime = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || !mounted) return

        channel = supabase
          .channel(`notifications:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!mounted) return
              const newNotification = payload.new as NotificationItem
              setNotifications((prev) => [newNotification, ...prev])
            }
          )
          .subscribe()

        realtimeSubscribed.current = true
      } catch (e) {
        console.error('Failed to setup realtime:', e)
      }
    }

    setupRealtime()

    return () => {
      mounted = false
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [])

  const handleClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        )
      } catch (e) {
        console.error(e)
      }
    }

    // Navigate based on notification type
    const data = notification.data
    if (data?.room_id) {
      router.push(`/chat/${data.room_id}`)
    } else if (notification.type === 'application_accepted') {
      router.push('/chat')
    } else if (data?.gig_id) {
      router.push(`/gigs/${data.gig_id}`)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (e) {
      console.error(e)
    }
  }

  // Filter notifications by category
  const filteredNotifications =
    activeCategory === 'all'
      ? notifications
      : notifications.filter((n) => getCategoryFromType(n.type) === activeCategory)

  // Group by date
  const groupedNotifications = filteredNotifications.reduce(
    (acc, notif) => {
      const group = getDateGroup(notif.created_at)
      if (!acc[group]) acc[group] = []
      acc[group].push(notif)
      return acc
    },
    {} as Record<string, NotificationItem[]>
  )

  const dateGroupOrder = ['오늘', '어제', '이번 주', '이전']

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-gray-900">알림</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-accent hover:text-accent font-medium"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pt-2 pb-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === tab.key
                    ? 'bg-ink text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-4xl mb-3">🔔</span>
            <p className="text-sm">
              {activeCategory === 'all' ? '알림이 없습니다' : '해당 카테고리의 알림이 없습니다'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {dateGroupOrder.map(
              (dateGroup) =>
                groupedNotifications[dateGroup] && (
                  <div key={dateGroup}>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                      {dateGroup}
                    </h2>
                    <div className="space-y-1 rounded-2xl bg-white border border-gray-100 overflow-hidden divide-y divide-gray-100">
                      {groupedNotifications[dateGroup].map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleClick(notification)}
                          className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors hover:bg-gray-50 active:bg-gray-100 ${
                            !notification.is_read ? 'bg-cream' : 'bg-white'
                          }`}
                        >
                          <span className="text-xl mt-0.5 flex-shrink-0">
                            {NOTIFICATION_ICONS[notification.type] || '📢'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm ${
                                !notification.is_read
                                  ? 'font-bold text-gray-900'
                                  : 'font-medium text-gray-700'
                              }`}
                            >
                              {notification.title}
                            </p>
                            {notification.body && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notification.body}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {timeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-ink rounded-full mt-2 flex-shrink-0 animate-pulse" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </main>
    </div>
  )
}
