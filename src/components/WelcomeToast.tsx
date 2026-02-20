'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function WelcomeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('welcome') === '1') {
      setShow(true)
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('welcome')
      router.replace(url.pathname, { scroll: false })

      const timer = setTimeout(() => setShow(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-green-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-medium">
        <span>🎉</span>
        <span>이메일 인증이 완료되었습니다! 환영해요!</span>
      </div>
    </div>
  )
}
