"use client"

interface RouteMapProps {
  origin: string
  destination: string
  className?: string
}

export function RouteMap({ origin, destination, className = "" }: RouteMapProps) {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 ${className}`}>
      <div className="relative" style={{ minHeight: "140px" }}>
        <svg
          viewBox="0 0 400 140"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ minHeight: "140px" }}
        >
          {/* Background road */}
          <rect x="0" y="0" width="400" height="140" fill="none" />
          
          {/* Dashed road line */}
          <line x1="70" y1="70" x2="330" y2="70" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8,4" />
          
          {/* Gradient path */}
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
            </marker>
          </defs>
          
          {/* Route arc */}
          <path
            d="M 70 70 Q 200 30 330 70"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
          
          {/* Truck icon along route */}
          <text x="190" y="44" textAnchor="middle" fontSize="16" fill="#3b82f6">🚛</text>
          
          {/* Origin circle */}
          <circle cx="70" cy="70" r="14" fill="#3b82f6" />
          <text x="70" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">출</text>
          
          {/* Destination circle */}
          <circle cx="330" cy="70" r="14" fill="#f97316" />
          <text x="330" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">도</text>
        </svg>
        
        {/* Labels */}
        <div className="flex justify-between px-2 -mt-1">
          <div className="text-center max-w-[45%]">
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">출발</div>
            <div className="text-xs font-semibold text-gray-800 truncate">{origin}</div>
          </div>
          <div className="text-center max-w-[45%]">
            <div className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide">도착</div>
            <div className="text-xs font-semibold text-gray-800 truncate">{destination}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
