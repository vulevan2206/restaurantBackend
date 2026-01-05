import { ChatOpenAI } from '@langchain/openai'
import { getVectorStore } from '../chatbot/vectorStore'

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0, // Chỉnh về 0 để trích xuất dữ liệu chính xác nhất
  apiKey: process.env.OPENAI_API_KEY
})

const chat = async (message: string) => {
  try {
    const vectorStore = getVectorStore()

    // BƯỚC 1: Trích xuất ý định giá từ khách hàng
    const extractPrompt = `
      Bạn là một công cụ trích xuất dữ liệu. 
      Nhiệm vụ: Trích xuất khoảng giá (minPrice, maxPrice) từ câu hỏi của khách hàng.
      Quy tắc:
      - Trả về DUY NHẤT một chuỗi JSON hợp lệ.
      - "k" hoặc "nghìn" tương ứng với 1000.
      - Nếu không đề cập giá, trả về null cho các trường.
      Ví dụ: "dưới 50k" -> {"maxPrice": 50000, "minPrice": null}
      
      Câu hỏi khách hàng: "${message}"
    `

    const extractRes = await llm.invoke(extractPrompt)
    let filter: any = { status: 'AVAILABLE' }

    try {
      // Làm sạch chuỗi trước khi parse để tránh lỗi Markdown
      const jsonString = extractRes.content
        .toString()
        .replace(/```json|```/g, '')
        .trim()
      const priceCriteria = JSON.parse(jsonString)

      if (priceCriteria?.maxPrice) {
        // Cấu hình lọc giá trên MongoDB Atlas
        filter.price = { $lte: priceCriteria.maxPrice }
      }
      if (priceCriteria?.minPrice) {
        filter.price = { ...filter.price, $gte: priceCriteria.minPrice }
      }
    } catch (e) {
      console.log('Lỗi trích xuất giá, bỏ qua lọc giá')
    }

    // BƯỚC 2: Truy xuất với bộ lọc thực tế
    // Quan trọng: Phải kiểm tra trên Atlas Index đã có field "price" type "filter" chưa
    const docs = await vectorStore.similaritySearch(message, 4, filter)

    // Kiểm tra nếu docs rỗng
    if (docs.length === 0) {
      return {
        message: 'Chatbot trả lời thành công',
        data: { reply: 'Hiện tại mình tìm không thấy món nào trong tầm giá đó cả. Bạn có muốn xem thử món khác không?' }
      }
    }

    const context = docs.map((d) => d.pageContent).join('\n')

    // BƯỚC 3: Tạo câu trả lời
    // const response = await llm.invoke([
    //   {
    //     role: 'system',
    //     content: `Bạn là nhân viên phục vụ. Chỉ gợi ý món dựa trên DANH SÁCH MÓN PHÙ HỢP bên dưới. Trả lời thân thiện.`
    //   },
    //   {
    //     role: 'user',
    //     content: `DANH SÁCH MÓN PHÙ HỢP:\n${context}\n\nKhách hỏi: ${message}`
    //   }
    // ])

//     const response = await llm.invoke([
//   {
//     role: 'system',
//     content: `
// Bạn là nhân viên nhà hàng. Trả về câu trả lời dưới dạng JSON nghiêm ngặt:
// {
//   "reply": "văn bản phản hồi thân thiện",
//   "productIds": ["id1", "id2"] 
// }
// Lưu ý: "productIds" là mảng các productId lấy từ phần metadata của ngữ cảnh.
// `
//   },
//   {
//     role: 'user',
//     content: `Ngữ cảnh món ăn:\n${context}\n\nKhách hỏi: ${message}`
//   }
// ]);
const response = await llm.invoke([
  {
    role: 'system',
    content: `
      Bạn là nhân viên nhà hàng. Trả về JSON:
      {
        "reply": "văn bản phản hồi",
        "productIds": ["ID_THỰC_TẾ"]
      }
      LƯU Ý QUAN TRỌNG: 
      - Chỉ lấy ID từ danh sách được cung cấp. 
      - ID là chuỗi mã số (ví dụ: 659bd...) xuất hiện sau chữ "ID:" trong ngữ cảnh.
      - Tuyệt đối không tự chế ID bằng tên món ăn.
    `
  },
  {
    role: 'user',
    content: `Danh sách món phù hợp:\n${docs.map(d => `ID: ${d.metadata.productId || d.metadata._id}\nNội dung: ${d.pageContent}`).join('\n---\n')}\n\nKhách hỏi: ${message}`
  }
]);
    return {
      message: 'Chatbot trả lời thành công',
      data: { reply: response.content }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export default { chat }
