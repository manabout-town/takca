import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "dark" | "light"
}

export function Logo({ size = "md", variant = "dark" }: LogoProps) {
  const scale = size === "sm" ? 0.8 : size === "lg" ? 1.25 : 1
  const w = Math.round(84 * scale)
  const h = Math.round(28 * scale)
  const textFill = variant === "light" ? "#FFFFFF" : "#0F172A"
  const accentFill = variant === "light" ? "#818CF8" : "#4F46E5"

  return (
    <Link href="/" aria-label="화물로 홈" className="inline-flex items-center">
      <svg
        width={w}
        height={h}
        viewBox="0 0 84 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        <text
          x="0"
          y="20"
          fontFamily="-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif"
          fontSize="20"
          fontWeight="800"
          letterSpacing="-0.8"
          fill={textFill}
        >
          화물로
        </text>
        {/* Route accent: origin dot → line → destination dot */}
        <circle cx="1.5" cy="25.5" r="1.5" fill={accentFill} />
        <rect x="5" y="24.75" width="46" height="1.5" rx="0.75" fill={accentFill} />
        <circle cx="55" cy="25.5" r="2.5" fill={accentFill} />
      </svg>
    </Link>
  )
}
