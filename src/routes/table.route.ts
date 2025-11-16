import express from 'express'
import {
  addTable,
  checkAvailableTable,
  deleteTable,
  getAllTables,
  leaveTable,
  updateTable,
  checkTableSession,
  createTableSession,
  unlockTableSession,
  updateSessionActivity
} from '~/controllers/table.controller'
import authMiddleware from '~/middlewares/auth.middleware'
import { wrapAsync } from '~/utils/response'

const router = express.Router()

router.post('/', authMiddleware.verifyAccessToken, authMiddleware.verifyAdmin, wrapAsync(addTable))
router.post('/check-available-table', wrapAsync(checkAvailableTable))
router.get('/', authMiddleware.verifyAccessToken, authMiddleware.verifyAdmin, wrapAsync(getAllTables))
router.post('/leave', wrapAsync(leaveTable))
router.patch('/:id', authMiddleware.verifyAccessToken, authMiddleware.verifyAdmin, wrapAsync(updateTable))
router.delete('/:id', authMiddleware.verifyAccessToken, authMiddleware.verifyAdmin, wrapAsync(deleteTable))

// Table session management
router.get('/session/check', wrapAsync(checkTableSession))
router.post('/session/create', wrapAsync(createTableSession))
router.post('/session/unlock', authMiddleware.verifyAccessToken, wrapAsync(unlockTableSession))
router.post('/session/activity', wrapAsync(updateSessionActivity))

export default router
