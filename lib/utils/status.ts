import type { OrderStatus, MatchStatus, EscrowStatus, DisputeStatus } from "@/lib/types"

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "매칭 대기",
  matched: "매칭 완료",
  in_progress: "운송 중",
  completed: "완료",
  cancelled: "취소",
  disputed: "분쟁 중",
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  matched: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  disputed: "bg-red-100 text-red-800",
}

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  accepted: "수락됨",
  in_progress: "운송 중",
  completed: "완료",
  cancelled: "취소",
}

export const ESCROW_STATUS_LABEL: Record<EscrowStatus, string> = {
  held: "보관 중",
  released: "지급 완료",
  refunded: "환불 완료",
  disputed: "분쟁 중",
}

export const DISPUTE_STATUS_LABEL: Record<DisputeStatus, string> = {
  open: "접수됨",
  investigating: "조사 중",
  resolved: "해결됨",
}
