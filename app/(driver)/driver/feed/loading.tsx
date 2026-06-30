export default function FeedLoading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-40" />
        <div className="h-4 bg-gray-100 rounded w-24" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-6">
        <div className="h-10 bg-gray-200 rounded-xl flex-1" />
        <div className="h-10 bg-gray-200 rounded-xl w-24" />
      </div>

      {/* Order cards */}
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-12" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-8 bg-orange-100 rounded-xl w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
