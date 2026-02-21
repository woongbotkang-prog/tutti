export default function MainLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-cream-dark border-t-ink rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">로딩 중...</p>
      </div>
    </div>
  )
}
