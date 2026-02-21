'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  room_id: string
  content: string
  sender_id: string
  created_at: string
  is_deleted: boolean
}

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  // 중요: supabase 인스턴스를 useMemo로 안정화하여 Realtime 연결이 끊기지 않게 함
  const supabase = useMemo(() => createClient(), [])
  const { roomId } = params

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUserName, setOtherUserName] = useState('')
  const [gigTitle, setGigTitle] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [shouldShowReviewPrompt, setShouldShowReviewPrompt] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const presenceChannelRef = useRef<RealtimeChannel | null>(null)
  const messagesRef = useRef<Message[]>([])
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // messagesRef를 항상 최신으로 유지
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  // 읽음 처리
  const markAsRead = useCallback(async (uid: string) => {
    await supabase
      .from('chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', uid)
  }, [roomId, supabase])

  // 초기화: 인증 → 구독 → 메시지 로드 (순서 중요!)
  useEffect(() => {
    let mounted = true

    const init = async () => {
      // 1. 인증 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      if (!mounted) return
      setUserId(user.id)

      // 2. Realtime 구독 먼저 설정 (메시지 누락 방지)
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          const newMsg = payload.new as Message
          if (!mounted) return

          setMessages(prev => {
            // 중복 체크 (같은 ID)
            if (prev.some(m => m.id === newMsg.id)) return prev

            // 임시 메시지 교체 (optimistic update)
            const tempIdx = prev.findIndex(
              m => m.id.startsWith('temp-') &&
                   m.content === newMsg.content &&
                   m.sender_id === newMsg.sender_id
            )
            if (tempIdx >= 0) {
              const updated = [...prev]
              updated[tempIdx] = newMsg
              return updated
            }

            return [...prev, newMsg]
          })

          scrollToBottom()

          // 상대방 메시지 수신 시 읽음 처리
          if (newMsg.sender_id !== user.id) {
            markAsRead(user.id)
          }
        })
        .subscribe((status) => {
          if (!mounted) return
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected')
          } else {
            setConnectionStatus('connecting')
          }
        })

      channelRef.current = channel

      // 2.5. Presence 채널 (타이핑 인디케이터)
      const presenceChannel = supabase
        .channel(`typing:${roomId}`)
        .on('presence', { event: 'sync' }, () => {
          if (!mounted) return
          const state = presenceChannel.presenceState()
          const others = Object.values(state).flat().filter(
            (p: any) => p.user_id !== user.id && p.is_typing
          )
          setIsOtherTyping(others.length > 0)
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.debug('Presence channel status:', status)
          }
        })

      presenceChannelRef.current = presenceChannel

      // 3. 채팅방 메타 정보 로드 (병렬)
      const [participantsRes, roomRes, messagesRes] = await Promise.all([
        // 상대방 이름
        supabase
          .from('chat_participants')
          .select('user_id, user:user_profiles(display_name)')
          .eq('room_id', roomId)
          .neq('user_id', user.id)
          .limit(1),
        // 공고 제목 및 application 정보
        supabase
          .from('chat_rooms')
          .select('application:applications(id, status, gig:gigs(id, title, status))')
          .eq('id', roomId)
          .single(),
        // 메시지 로드
        supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(100),
      ])

      if (!mounted) return

      // 상대방 이름 설정
      if (participantsRes.data?.[0]) {
        const u = participantsRes.data[0].user as { display_name?: string } | null
        setOtherUserName(u?.display_name || '상대방')
      }

      // 공고 제목 및 application 설정
      if (roomRes.data) {
        const app = roomRes.data.application as { id?: string; status?: string; gig?: { id?: string; title?: string; status?: string } } | null | undefined
        setGigTitle(app?.gig?.title ? String(app.gig.title) : '')

        // Check if should show review prompt
        if (app?.id && app?.status === 'accepted' && app?.gig?.status === 'closed') {
          setApplicationId(app.id)
          // Check if already reviewed (use maybeSingle since we're checking existence)
          const { data: existingReview, error: reviewError } = await supabase
            .from('reviews')
            .select('id')
            .eq('application_id', app.id)
            .eq('reviewer_id', user.id)
            .maybeSingle()

          if (!reviewError && !existingReview) {
            setShouldShowReviewPrompt(true)
          }
        }
      }

      // 메시지 설정
      if (messagesRes.data) {
        setMessages(messagesRes.data)
      }

      setLoading(false)
      scrollToBottom()

      // 4. 읽음 처리
      await markAsRead(user.id)
    }

    init()

    return () => {
      mounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current)
        presenceChannelRef.current = null
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [roomId, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  // 타이핑 상태 broadcast
  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (!presenceChannelRef.current || !userId) return
    presenceChannelRef.current.track({
      user_id: userId,
      is_typing: isTyping,
    })
  }, [userId])

  const handleTyping = useCallback(() => {
    broadcastTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      broadcastTyping(false)
    }, 2000)
  }, [broadcastTyping])

  // 메시지 전송
  const handleSend = async () => {
    if (!newMessage.trim() || sending || !userId) return

    // 메시지 길이 제한 (5000자)
    if (newMessage.length > 5000) {
      alert('메시지는 5000자까지 입력할 수 있습니다.')
      return
    }

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')
    broadcastTyping(false)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      room_id: roomId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      is_deleted: false,
    }
    setMessages(prev => [...prev, tempMessage])
    scrollToBottom()

    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: userId,
      content,
    })

    if (error) {
      // 실패 시 롤백
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(content)
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/chat">
            <button className="text-gray-500 hover:text-gray-700" aria-label="채팅 목록으로">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </Link>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <div className="flex-1 px-4 py-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-3 ${i % 2 === 0 ? 'bg-cream' : 'bg-gray-100'} animate-pulse`}>
              <div className="h-4 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/chat">
          <button className="text-gray-500 hover:text-gray-700" aria-label="채팅 목록으로">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900">{otherUserName || '채팅'}</h1>
          {gigTitle && <p className="text-xs text-gray-400 truncate max-w-[200px]">{gigTitle}</p>}
        </div>
        {connectionStatus !== 'connected' && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
          </span>
        )}
      </div></header>

      {/* 리뷰 작성 배너 */}
      {shouldShowReviewPrompt && applicationId && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">이 매칭에 대한 리뷰를 작성해주세요</p>
              <p className="text-xs text-amber-700 mt-0.5">양쪽이 모두 리뷰를 작성하면 서로의 평가가 공개돼요</p>
            </div>
            <Link href={`/reviews/write?application_id=${applicationId}`}>
              <button className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors">
                리뷰 작성
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* 연결 끊김 배너 */}
      {connectionStatus === 'disconnected' && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center">
          <p className="text-xs text-red-600">
            실시간 연결이 끊겼습니다. 새로고침하면 다시 연결됩니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold text-red-700 underline mt-1"
          >
            새로고침
          </button>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            첫 번째 메시지를 보내보세요!
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] sm:max-w-[60%] rounded-2xl px-4 py-2.5 ${
                isMine ? 'bg-ink text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              } ${msg.id.startsWith('temp-') ? 'opacity-70' : ''}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-cream-dark' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        {/* 타이핑 인디케이터 */}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 — shrink-0 + 고정 패딩으로 흔들림 방지 */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white shrink-0" style={{ minHeight: '60px' }}>
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <textarea
            value={newMessage}
            onChange={e => { setNewMessage(e.target.value); handleTyping() }}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            maxLength={5000}
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none overflow-hidden leading-5"
            style={{ maxHeight: '128px', minHeight: '40px' }}
            aria-label="메시지 입력"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-ink hover:bg-ink-light disabled:opacity-40 flex items-center justify-center transition-colors shrink-0 mb-0"
            aria-label="메시지 전송"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
