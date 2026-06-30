export default function WalletLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-32" />
        <div className="h-4 bg-gray-100 rounded w-20" />
      </div>
      {/* Balance card */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 space-y-3">
        <div className="h-4 bg-orange-100 rounded w-20" />
        <div className="h-10 bg-orange-200 rounded-lg w-36" />
        <div className="h-4 bg-orange-100 rounded w-24" />
      </div>
      {/* Ledger rows */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
