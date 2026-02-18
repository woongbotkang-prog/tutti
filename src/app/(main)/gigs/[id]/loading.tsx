export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <div className="h-6 w-6 bg-gray-100 rounded animate-pulse" />
        <div className="h-5 w-48 bg-gray-100 rounded-lg animate-pulse" />
      </header>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-5 w-8 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="h-7 w-3/4 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="h-5 w-20 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
