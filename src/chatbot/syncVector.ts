import { OpenAIEmbeddings } from "@langchain/openai";
import { ProductModel } from "~/models/product.model";

interface ICategory {
  _id: string;
  name: string;
}

export const syncProductsToVector = async () => {
  // Ép kiểu cho kết quả của populate
  const products = await ProductModel.find({ status: 'AVAILABLE' })
    .populate<{ category: ICategory }>('category') 
    .lean();

  const embeddings = new OpenAIEmbeddings({ 
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY 
  });

  console.log(`Bắt đầu đồng bộ ${products.length} sản phẩm...`);

  for (const p of products) {
    const content = `
Tên món: ${p.name}
Giá: ${p.price} VNĐ
Loại: ${p.category?.name ?? 'Không xác định'}
Mô tả: ${p.description}
    `.trim();

    const vector = await embeddings.embedQuery(content);
    
    await ProductModel.updateOne(
      { _id: p._id },
      { $set: { embedding: vector, content: content } }
    );
  }
  console.log("Đồng bộ hoàn tất!");
};