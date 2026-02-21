'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h2 className="text-lg font-bold text-gray-900 mb-2">문제가 발생했어요</h2>
      <p className="text-sm text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink-light transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
