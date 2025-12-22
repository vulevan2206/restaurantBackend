// src/chatbot/chat.controller.ts
import { Request, Response } from 'express'
import { ChatOpenAI } from '@langchain/openai'

import { getVectorStore } from '../chatbot/vectorStore'

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.4
})

export const chat = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body as { message?: string }

  if (!message) {
    res.status(400).json({ error: 'Message is required' })
    return
  }

  const vectorStore = getVectorStore()
  const docs = await vectorStore.similaritySearch(message, 4)
  const context = docs.map((d) => d.pageContent).join('\n')

  const response = await llm.invoke([
    {
      role: 'system',
      content: `
Bạn là chatbot tư vấn món ăn cho nhà hàng.
Chỉ sử dụng dữ liệu được cung cấp.
Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
      `
    },
    {
      role: 'user',
      content: `
Danh sách món:
${context}

Câu hỏi của khách:
${message}
      `
    }
  ])

  res.json({ reply: response.content })
}
