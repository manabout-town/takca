import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "yyyy.MM.dd HH:mm", { locale: ko })
}

export function formatDateOnly(date: string | Date): string {
  return format(new Date(date), "yyyy.MM.dd", { locale: ko })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
}

export function calculateFee(amount: number, rate = 0.04): {
  platformFee: number
  driverPayout: number
} {
  const platformFee = Math.floor(amount * rate)
  const driverPayout = amount - platformFee
  return { platformFee, driverPayout }
}
