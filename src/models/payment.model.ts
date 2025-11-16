import mongoose, { Schema } from 'mongoose'
import { paymentStatus } from '~/enums/paymentStatus.enum'

const paymentSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true
    },
    requestId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    customer_id: {
      type: String
    },
    table_number: {
      type: Number
    },
    status: {
      type: String,
      enum: Object.values(paymentStatus),
      default: paymentStatus.PENDING
    },
    momoResponse: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

export const PaymentModel = mongoose.model('payments', paymentSchema)
