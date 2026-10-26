import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import authRoutes from './routes/auth.js'
import internRoutes from './routes/interns.js'
import boardRoutes from './routes/boards.js'
import notificationsRouter from './routes/notifications.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from the .env file')
}

console.log('DATABASE_URL loaded:', Boolean(process.env.DATABASE_URL))

const app = express()

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())

app.use(cors({ origin: allowedOrigins }))

app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Kraft' })
})

app.get('/api/db-check', async (req, res) => {
    try {
        const result = await pool.query('select now()')
        res.json({ connected: true, time: result.rows[0].now })
    }   catch (err) {
        console.error(err)
        res.status(500).json({ connected: false })
    }
})

app.use('/api/auth', authRoutes)
app.use('/api/interns', internRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/notifications', notificationsRouter)

if (!process.env.VERCEL) {
  const PORT = 4000
  app.listen(PORT, () => {
    console.log(`Kraft server running on http://localhost:${PORT}`)
  })
}

export default app

