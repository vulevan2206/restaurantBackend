import { Application } from 'express'
import AuthRouter from './auth.route'
import CategoryRouter from './category.route'
import TableRouter from './table.route'

const routes = (app: Application) => {
  app.use('/api/auth', AuthRouter)
  app.use('/api/categories', CategoryRouter)
  app.use('/api/tables', TableRouter)
}

export default routes
