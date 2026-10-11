import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import authRoutes from './routes/auth.js'
import internRoutes from './routes/interns.js'
import boardRoutes from './routes/boards.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from the .env file')
}

console.log('DATABASE_URL loaded:', Boolean(process.env.DATABASE_URL))

const app = express()

app.use(cors())
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

const PORT = 4000
app.listen(PORT, () => {
    console.log(`Kraft server running on http://localhost:${PORT}`)
})

