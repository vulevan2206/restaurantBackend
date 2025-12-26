import { ChatOpenAI } from '@langchain/openai'
import { getVectorStore } from '../chatbot/vectorStore'

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.4
})

const chat = async (message: string) => {
  try {
    const vectorStore = getVectorStore();
    const docs = await vectorStore.similaritySearch(message, 4);

    const context = docs.map((d) => d.pageContent).join('\n');

    const response = await llm.invoke([
      {
        role: 'system',
        content: `
Bạn là nhân viên phục vụ nhà hàng.
- Chỉ tư vấn các món trong danh sách.
- Không tự bịa món mới.
- Nếu không có món phù hợp, nói rõ là không có.
- Trả lời thân thiện, tự nhiên, ngắn gọn.
`
      },
      {
        role: 'user',
        content: `
Danh sách món phù hợp với yêu cầu:
${context}

Khách hỏi:
${message}

Hãy gợi ý 2–3 món phù hợp nhất.
`
      }
    ]);

    const reply =
      typeof response.content === 'string'
        ? response.content
        : response.content.map((item: any) => item.text).join('');

    return {
      message: 'Chatbot trả lời thành công',
      data: {
        reply
      }
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default {
  chat
}
