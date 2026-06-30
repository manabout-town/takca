export default function NewOrderLoading() {
  return (
    <div className="animate-pulse space-y-6 max-w-xl">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded-lg w-32" />
        <div className="h-4 bg-gray-100 rounded w-48" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-11 bg-gray-100 rounded-xl w-full" />
        </div>
      ))}
      <div className="h-12 bg-orange-200 rounded-xl w-full" />
    </div>
  )
}
