import { Application } from 'express'
import AuthRouter from './auth.route'
import CategoryRouter from './category.route'
import TableRouter from './table.route'
import ProductRouter from './product.route'
import UserRouter from './user.route'
import OrderRouter from './order.route'
import ChatbotRouter from './chatbot.route'

const routes = (app: Application) => {
  app.use('/api/auth', AuthRouter)
  app.use('/api/categories', CategoryRouter)
  app.use('/api/tables', TableRouter)
  app.use('/api/products', ProductRouter)
  app.use('/api/users', UserRouter)
  app.use('/api/orders', OrderRouter)
  app.use('/api/chatbot', ChatbotRouter)
}

export default routes
