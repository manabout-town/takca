export default function CalendarLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-28" />
        <div className="h-4 bg-gray-100 rounded w-36" />
      </div>
      {/* Calendar grid */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
