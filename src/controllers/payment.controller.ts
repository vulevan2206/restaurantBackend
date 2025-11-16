import { Request, Response } from 'express'
import orderService from '~/services/order.service'
import { createMomoPaymentQR, MomoPaymentParams } from '~/services/payment.service'
import { responseSuccess } from '~/utils/response'

export const createMomoQRController = async (req: { body: MomoPaymentParams }, res: { json: (arg0: { message: string; data: any }) => void }, next: (arg0: unknown) => void) => {
  try {
    const result = await createMomoPaymentQR(req.body)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

