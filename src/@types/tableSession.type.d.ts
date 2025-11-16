interface TableSession {
  _id?: string
  table_number: number
  customer_id: string
  customer_name: string
  is_active: boolean
  logged_in_at: Date
  last_activity: Date
  logged_out_at?: Date
  createdAt?: Date
  updatedAt?: Date
}

interface TableSessionRequest {
  table_number: number
  customer_id: string
  customer_name: string
  token: string
}

interface TableSessionUnlockRequest {
  table_number: number
  customer_id?: string
}
