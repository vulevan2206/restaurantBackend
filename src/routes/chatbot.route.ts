import express from 'express'
import { chat } from '~/controllers/chatbot.controller'
import { wrapAsync } from '~/utils/response'

const router = express.Router()

router.post('/chat', wrapAsync(chat))

export default router
