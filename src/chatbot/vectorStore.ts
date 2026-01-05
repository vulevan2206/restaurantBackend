import { MongoDBAtlasVectorSearch } from '@langchain/mongodb'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MongoClient } from 'mongodb'

// Khởi tạo client kết nối
const client = new MongoClient(process.env.MONGO_URI as string)
// Trỏ trực tiếp đến collection 'products' trong database 'tlcn'
const collection = client.db('tlcn').collection('products')

let vectorStore: MongoDBAtlasVectorSearch | null = null

export async function initVectorStore(): Promise<void> {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY
  })

  // Cách khởi tạo đúng cho phiên bản mới
  vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: collection as any,
    indexName: 'vector_index', // Tên index bạn tạo trên Atlas
    embeddingKey: 'embedding', // Tên trường chứa vector (thay cho columnName)
    textKey: 'content' // Tên trường chứa nội dung text
  })
}

export function getVectorStore(): MongoDBAtlasVectorSearch {
  if (!vectorStore) {
    throw new Error('VectorStore chưa được khởi tạo')
  }
  return vectorStore
}
