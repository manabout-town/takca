export type UserRole = 'shipper' | 'driver' | 'admin'
export type OrderStatus = 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type MatchStatus = 'accepted' | 'in_progress' | 'completed' | 'cancelled'
export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed'
export type DisputeStatus = 'open' | 'investigating' | 'resolved'
export type DisputeResolution = 'driver_win' | 'shipper_win' | 'partial_refund'
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type KYCSubmissionStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'manual_review'

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  role: UserRole
  status: 'active' | 'pending' | 'suspended'
  verification_status: KYCStatus
  created_at: string
}

export interface KYCSubmission {
  id: string
  user_id: string
  role: UserRole
  business_registration_url: string
  driver_license_url?: string
  ocr_result?: Record<string, unknown>
  government_api_result?: Record<string, unknown>
  claude_vision_result?: Record<string, unknown>
  confidence_score?: number
  status: KYCSubmissionStatus
  rejection_reason?: string
  admin_note?: string
  reviewed_by?: string
  created_at: string
  updated_at: string
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
  title?: string
  origin: string
  destination: string
  vehicle_count: number
  vehicle_notes?: string
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

export const VEHICLE_CARRY_TYPES = [
  '승용차',
  'SUV',
  '승합차',
  '픽업트럭',
  '수입차',
  '전기차',
  '하이브리드',
  '기타',
] as const

export type NotificationType = 'match_request' | 'order_status' | 'chat' | 'escrow' | 'dispute' | 'kyc'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  link?: string
  is_read: boolean
  created_at: string
}

export const CARRIER_VEHICLE_TYPES = [
  '카 캐리어 (소형, 2~4대)',
  '카 캐리어 (중형, 5~8대)',
  '카 캐리어 (대형, 9~12대)',
] as const

export interface ConditionReportChecklist {
  exterior_ok?: boolean
  glass_ok?: boolean
  tires_ok?: boolean
  interior_ok?: boolean
  engine_ok?: boolean
  mileage?: number | null
}

export interface ConditionReportPhoto {
  url: string
  caption: string
}

export interface ConditionReport {
  id: string
  match_id: string
  type: 'pickup' | 'delivery'
  photos: ConditionReportPhoto[]
  checklist: ConditionReportChecklist
  notes?: string | null
  submitted_by: string
  shipper_confirmed: boolean
  created_at: string
}
