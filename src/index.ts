import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { server } from '~/app'

// Load environment variables tùy theo NODE_ENV
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: env === 'production' ? '.env.production' : '.env' })

const port = process.env.PORT ?? 8080
const host = process.env.HOST || '0.0.0.0'

;(async () => {
  try {
    const chalk = (await import('chalk')).default

    // Chalk styles
    const connected = chalk.bold.cyan
    const error = chalk.bold.yellow
    const disconnected = chalk.bold.red
    const warning = chalk.bold.yellow

    // MongoDB connection
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri) {
      console.error(error('MongoDB URI is not defined in the environment variables!'))
      process.exit(1)
    }

    // MongoDB connection options
    const mongooseOptions: mongoose.ConnectOptions = {
      retryWrites: true,
      w: 'majority',
      appName: 'restaurant-backend'
    }

    await mongoose.connect(mongoUri, mongooseOptions)
    console.log(connected('Connection to MongoDB successful!'))

    mongoose.connection.on('connected', () => {
      console.log(connected('Mongoose default connection is open to MongoDB Atlas'))
    })

    mongoose.connection.on('error', (err) => {
      console.log(error(`Mongoose default connection error: ${err}`))
    })

    mongoose.connection.on('disconnected', () => {
      console.log(disconnected('Mongoose default connection disconnected'))
    })

    server.listen(Number(port), host, () => {
      console.log(chalk.green(`Server is running on http://${host}:${port}`))
      console.log(
        warning(`CORS configured for: ${process.env.CORS_ORIGIN || 'https://restaurantfrontend-a8z7.onrender.com'}`)
      )
    })

    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log(disconnected('Mongoose default connection disconnected through app termination'))
      process.exit(0)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
})()
