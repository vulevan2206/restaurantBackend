// src/chatbot/buildDocuments.ts
import { ProductModel } from '~/models/product.model'
import { CategoryModel } from '../models/category.model'

export type RagDocument = {
  content: string
  metadata: {
    productId: string
  }
}

export const buildDocuments = async (): Promise<RagDocument[]> => {
  const products = await ProductModel.find({ status: 'AVAILABLE' })
    .populate<{ category?: { name: string } }>('category')
    .lean()

  return products.map((p) => ({
    content: `
Tên món: ${p.name}
Giá: ${p.price} VNĐ
Loại: ${p.category?.name ?? 'Không xác định'}
Mô tả: ${p.description}
Lượt bán: ${p.sold}
Lượt xem: ${p.view}
    `.trim(),
    metadata: {
      productId: p._id.toString()
    }
  }))
}
