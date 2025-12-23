import { Request, Response } from 'express'
import chatbotService from '~/services/chatbot.service'
import { responseSuccess } from '~/utils/response'

export const chat = async (req: Request, res: Response) => {
  try {
    
    const body: { message?: string } = req.body

    if (!body.message) {
      throw new Error('Message is required')
    }

    const result = await chatbotService.chat(body.message)
    console.log('CHATBOT RESULT:', result);

    return responseSuccess(res, result)
  } catch (error) {
    console.log(error)
    throw error
  }
}
