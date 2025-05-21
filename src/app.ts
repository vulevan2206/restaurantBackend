import express, { Application } from 'express'
import cors from 'cors'
import routes from '~/routes/index.route'
import { responseError } from '~/utils/response'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app: Application = express()
const server = createServer(app)

// Configure CORS for your Render domain
const corsOptions = {
  origin: 'https://restaurantbackend-yzc4.onrender.com',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}

// Initialize Socket.io with proper CORS
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'], // Recommended for production
  allowEIO3: true // For Socket.io v2 compatibility if needed
})

// Apply CORS middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting would be good to add here in production
// Example: app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

routes(app)

// Socket.io connection handling
export const userSockets: Record<string, any> = {} // Better typing

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id)

  // Add authentication middleware for sockets in production
  socket.on('registerUser', (userId) => {
    userSockets[userId] = socket
  })

  socket.on('addOrder', () => {
    // Implement your order logic
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    for (const userId in userSockets) {
      if (userSockets[userId] === socket) {
        delete userSockets[userId]
        break
      }
    }
  })
})

// Error handling middleware
app.use(function (err: any, req: any, res: any, next: any) {
  responseError(res, err)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

export default app
export { server, io }
