import { Application } from 'express'
import AuthRouter from './auth.route'
import CategoryRouter from './category.route'

const routes = (app: Application) => {
  app.use('/api/auth', AuthRouter)
  app.use('/api/categories', CategoryRouter)
}

export default routes
