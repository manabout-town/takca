export type UserRole = 'shipper' | 'driver' | 'admin'
export type OrderStatus = 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type MatchStatus = 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed'
export type DisputeStatus = 'open' | 'investigating' | 'resolved'
export type DisputeResolution = 'driver_win' | 'shipper_win' | 'partial_refund'

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  role: UserRole
  status: 'active' | 'pending' | 'suspended'
  created_at: string
}

export interface DriverProfile {
  id: string
  user_id: string
  vehicle_number: string
  vehicle_type: string
  business_number?: string
  is_verified: boolean
  rating_avg: number
  rating_count: number
  users?: User
}

export interface ShipperProfile {
  id: string
  user_id: string
  company_name?: string
  business_number?: string
  users?: User
}

export interface Order {
  id: string
  shipper_id: string
  origin: string
  destination: string
  cargo_type: string
  cargo_detail?: string
  price: number
  status: OrderStatus
  is_urgent: boolean
  urgent_fee: number
  pickup_at: string
  created_at: string
  shippers?: User
  matches?: Match[]
}

export interface Match {
  id: string
  order_id: string
  driver_id: string
  status: MatchStatus
  matched_at: string
  completed_at?: string
  orders?: Order
  drivers?: User
  driver_profiles?: DriverProfile
}

export interface Escrow {
  id: string
  order_id: string
  match_id: string
  total_amount: number
  platform_fee: number
  driver_payout: number
  status: EscrowStatus
  pg_transaction_id?: string
  held_at: string
  released_at?: string
}

export interface Chat {
  id: string
  match_id: string
  sender_id: string
  message: string
  sent_at: string
  sender?: User
}

export interface Review {
  id: string
  match_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface Dispute {
  id: string
  match_id: string
  escrow_id: string
  raised_by: string
  reason: string
  status: DisputeStatus
  resolution?: DisputeResolution
  created_at: string
  resolved_at?: string
}

export const CARGO_TYPES = [
  '일반 화물',
  '냉동/냉장',
  '위험물',
  '가구/가전',
  '건자재',
  '농산물',
  '의류/잡화',
  '기계/장비',
  '기타',
] as const

export const VEHICLE_TYPES = [
  '다마스',
  '라보',
  '1톤 트럭',
  '1.4톤 트럭',
  '2.5톤 트럭',
  '3.5톤 트럭',
  '5톤 트럭',
  '11톤 트럭',
  '25톤 트럭',
] as const
