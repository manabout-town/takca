export default function MatchesLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-28" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
      <div className="grid gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-5 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-2 mt-2">
              <div className="h-10 bg-gray-200 rounded-xl flex-1" />
              <div className="h-10 bg-gray-100 rounded-xl flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
