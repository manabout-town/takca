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
    <Link href={href} aria-label="화물로 홈" className={`inline-flex items-center ${gap} select-none`}>
      {/* Icon mark */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="36" height="36" rx="9" fill="#F97316" />

        {/* Truck body */}
        <rect x="5" y="11" width="16" height="10" rx="2" fill="white" />

        {/* Cab */}
        <path d="M21 14.5h4.5L28 18v3.5h-7v-7z" fill="white" opacity="0.92" />

        {/* Cab window */}
        <rect x="21.5" y="15" width="4" height="3.5" rx="1" fill="#F97316" opacity="0.55" />

        {/* Front bumper */}
        <rect x="28" y="19" width="2" height="2.5" rx="1" fill="white" opacity="0.7" />

        {/* Wheels */}
        <circle cx="9"  cy="23.5" r="2.5" fill="white" />
        <circle cx="16" cy="23.5" r="2.5" fill="white" />
        <circle cx="24" cy="23.5" r="2.5" fill="white" />

        {/* Hubcaps */}
        <circle cx="9"  cy="23.5" r="1" fill="#F97316" />
        <circle cx="16" cy="23.5" r="1" fill="#F97316" />
        <circle cx="24" cy="23.5" r="1" fill="#F97316" />
      </svg>

      {/* Wordmark */}
      <span className={`font-extrabold tracking-tight leading-none ${text} ${textColor}`}>
        화물<span className="text-orange-500">로</span>
      </span>
    </Link>
  )
}
