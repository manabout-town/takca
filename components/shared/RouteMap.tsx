"use client"

interface RouteMapProps {
  origin: string
  destination: string
  className?: string
}

export function RouteMap({ origin, destination, className = "" }: RouteMapProps) {
  return (
    <div className={`bg-gray-50 border border-gray-100 rounded-xl p-4 ${className}`}>
      <svg viewBox="0 0 400 110" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" fill="#10b981" />
          </marker>
        </defs>

        {/* Background dots */}
        <line x1="70" y1="55" x2="330" y2="55" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="5,4" />

        {/* Route path */}
        <path d="M 70 55 Q 200 20 330 55" fill="none" stroke="url(#routeGrad)"
          strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrowhead)" />

        {/* Truck */}
        <text x="195" y="32" textAnchor="middle" fontSize="14">🚛</text>

        {/* Origin dot */}
        <circle cx="70" cy="55" r="10" fill="#6366f1" />
        <text x="70" y="59" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">출</text>

        {/* Destination dot */}
        <circle cx="330" cy="55" r="10" fill="#10b981" />
        <text x="330" y="59" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">도</text>
      </svg>

      <div className="flex justify-between mt-2 px-1">
        <div className="max-w-[45%]">
          <div className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider mb-0.5">출발</div>
          <div className="text-xs font-medium text-gray-700 truncate">{origin}</div>
        </div>
        <div className="max-w-[45%] text-right">
          <div className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider mb-0.5">도착</div>
          <div className="text-xs font-medium text-gray-700 truncate">{destination}</div>
        </div>
      </div>
    </div>
  )
}
