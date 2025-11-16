import express from 'express'
import {
  addOrder,
  deleteOrder,
  findCustomer,
  getStatisticsOrder,
  getStatisticsTable,
  getStatisticsOrderByTable,
  getUserOrder,
  updateOrder
} from '~/controllers/order.controller'
import { createMomoQRController } from '~/controllers/payment.controller'
import authMiddleware from '~/middlewares/auth.middleware'
import { wrapAsync } from '~/utils/response'

const router = express.Router()

router.post('/', wrapAsync(addOrder))
router.get('/', wrapAsync(getUserOrder))
router.get('/statistics', authMiddleware.verifyAccessToken, wrapAsync(getStatisticsOrder))
router.get('/statistics-table', authMiddleware.verifyAccessToken, wrapAsync(getStatisticsTable))
router.get('/statistics-order-by-table', authMiddleware.verifyAccessToken, wrapAsync(getStatisticsOrderByTable))
router.patch('/:id', authMiddleware.verifyAccessToken, wrapAsync(updateOrder))
router.delete('/:id', authMiddleware.verifyAccessToken, wrapAsync(deleteOrder))
router.get('/customer', authMiddleware.verifyAccessToken, wrapAsync(findCustomer))
router.post('/payment/momo/create-qr', createMomoQRController)
// router.get('/payment/momo/create-qr', createMomoQRController)


export default router
