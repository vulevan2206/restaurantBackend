export const paymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type PaymentStatus = keyof typeof paymentStatus
