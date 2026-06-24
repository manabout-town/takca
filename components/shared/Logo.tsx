import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "dark" | "light"
  href?: string
}

const sizes = {
  sm: { icon: 24, text: "text-base", gap: "gap-1.5" },
  md: { icon: 30, text: "text-xl",   gap: "gap-2"   },
  lg: { icon: 38, text: "text-3xl",  gap: "gap-2.5" },
}

export function Logo({ size = "md", variant = "dark", href = "/" }: LogoProps) {
  const { icon, text, gap } = sizes[size]
  const textColor = variant === "light" ? "text-white" : "text-gray-900"

  return (
    <Link href={href} aria-label="탁카 홈" className={`inline-flex items-center ${gap} select-none`}>
      {/* Icon mark — car carrier */}
      <svg width={icon} height={icon} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="9" fill="#F97316" />
        {/* Carrier bed */}
        <rect x="3" y="20" width="26" height="3" rx="1" fill="white" />
        {/* Ramp */}
        <path d="M29 23 L33 26 L33 23 Z" fill="white" opacity="0.8" />
        {/* Cab */}
        <rect x="3" y="14" width="7" height="6" rx="1.5" fill="white" opacity="0.95" />
        <rect x="4" y="15" width="5" height="3.5" rx="1" fill="#F97316" opacity="0.5" />
        {/* Car on top */}
        <rect x="11" y="16" width="9" height="4" rx="1" fill="white" opacity="0.7" />
        <rect x="12.5" y="14.5" width="6" height="2" rx="1" fill="white" opacity="0.5" />
        {/* Car on bottom deck */}
        <rect x="11" y="21.5" width="8" height="2.5" rx="1" fill="#F97316" opacity="0.35" />
        {/* Wheels */}
        <circle cx="7" cy="26" r="2.5" fill="white" />
        <circle cx="7" cy="26" r="1" fill="#F97316" />
        <circle cx="26" cy="26" r="2.5" fill="white" />
        <circle cx="26" cy="26" r="1" fill="#F97316" />
        <circle cx="31" cy="26" r="2" fill="white" opacity="0.8" />
      </svg>

      {/* Wordmark */}
      <span className={`font-extrabold tracking-tight leading-none ${text} ${textColor}`}>
        탁<span className="text-orange-500">카</span>
      </span>
    </Link>
  )
}
