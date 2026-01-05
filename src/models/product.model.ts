import mongoose, { Schema } from 'mongoose'
import { productStatus } from '~/enums/productStatus.enum'
import { OpenAIEmbeddings } from "@langchain/openai"

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 1000
    },
    price: {
      type: Number,
      required: true,
      min: [1, 'Price must be greater than 0']
    },
    sold: {
      type: Number,
      required: true,
      min: [0, 'Sold must be greater or equal than 0'],
      default: 0
    },
    view: {
      type: Number,
      required: true,
      min: [0, 'View must be greater or equal than 0'],
      default: 0
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 1000
    },
    status: {
      type: String,
      required: true,
      enum: [productStatus.AVAILABLE, productStatus.UNAVAILABLE],
      default: productStatus.AVAILABLE
    },
    image: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 1000
    },
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'categories'
    },
    content: { type: String },
    embedding: { type: [Number] }
  },
  {
    timestamps: true
  }
)

// Middleware tự động tạo/cập nhật Vector trước khi lưu vào MongoDB Atlas
productSchema.pre('save', async function (next) {
  // Chỉ chạy khi có sự thay đổi ở các trường quan trọng đối với Chatbot
  if (this.isModified('name') || this.isModified('description') || this.isModified('price')) {
    try {
      const embeddings = new OpenAIEmbeddings({ 
        model: 'text-embedding-3-small',
        apiKey: process.env.OPENAI_API_KEY 
      });

      // Tạo chuỗi văn bản đại diện cho món ăn
      const content = `Tên món: ${this.name}\nGiá: ${this.price} VNĐ\nMô tả: ${this.description}`.trim();

      // Chuyển văn bản thành Vector
      const vector = await embeddings.embedQuery(content);

      // Cập nhật thông tin vào Document
      this.content = content;
      this.embedding = vector;
    } catch (error) {
      console.error("Lỗi tạo Embedding:", error);
    }
  }
  next();
});

export const ProductModel = mongoose.model('products', productSchema)