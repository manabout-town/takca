import Link from "next/link"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.3 : 1
  return (
    <Link href="/" aria-label="화물로 홈">
      <svg
        width={Math.round(96 * scale)}
        height={Math.round(28 * scale)}
        viewBox="0 0 96 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
      >
        {/* 화물로 한글 레터링 */}
        <text
          x="0" y="22"
          fontFamily="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
          fontSize="20"
          fontWeight="700"
          letterSpacing="-0.5"
          fill="#111827"
        >
          화물로
        </text>
        {/* 하단 포인트 라인 */}
        <rect x="0" y="25" width="60" height="2" rx="1" fill="#6366F1" />
        {/* 오른쪽 점 액센트 */}
        <circle cx="68" cy="14" r="3" fill="#6366F1" opacity="0.7" />
        <circle cx="78" cy="14" r="3" fill="#6366F1" opacity="0.4" />
        <circle cx="88" cy="14" r="3" fill="#6366F1" opacity="0.2" />
      </svg>
    </Link>
  )
}
