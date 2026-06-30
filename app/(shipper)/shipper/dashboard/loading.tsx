export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 bg-gray-200 rounded-lg w-48" />
          <div className="h-4 bg-gray-100 rounded w-24" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-24" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-3 md:p-5 min-h-[72px] flex flex-col items-center justify-center gap-2">
            <div className="w-9 h-9 bg-gray-200 rounded-xl" />
            <div className="h-3 bg-gray-100 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Order list */}
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 rounded w-24" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
