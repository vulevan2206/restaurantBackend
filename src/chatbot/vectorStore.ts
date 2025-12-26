import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { buildDocuments } from './buildDocuments'

let vectorStore: MemoryVectorStore | null = null

export async function initVectorStore(): Promise<void> {
  const docs = await buildDocuments()

  vectorStore = await MemoryVectorStore.fromTexts(
    docs.map((d) => d.content),
    docs.map((d) => d.metadata),
    new OpenAIEmbeddings({ model: 'text-embedding-3-small' })
  )
}

export function getVectorStore(): MemoryVectorStore {
  if (!vectorStore) {
    throw new Error('VectorStore chưa được khởi tạo')
  }
  return vectorStore
}
