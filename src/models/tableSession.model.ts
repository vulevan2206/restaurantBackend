import mongoose, { Schema } from 'mongoose'

const tableSessionSchema = new Schema(
  {
    table_number: {
      type: Number,
      required: true,
      ref: 'tables'
    },
    customer_id: {
      type: String,
      required: true,
      trim: true
    },
    customer_name: {
      type: String,
      required: true,
      trim: true
    },
    is_active: {
      type: Boolean,
      default: true
    },
    logged_in_at: {
      type: Date,
      default: Date.now
    },
    last_activity: {
      type: Date,
      default: Date.now
    },
    logged_out_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Index for fast lookup
tableSessionSchema.index({ table_number: 1, is_active: 1 })
tableSessionSchema.index({ customer_id: 1 })

export const TableSessionModel = mongoose.model('table_sessions', tableSessionSchema)
