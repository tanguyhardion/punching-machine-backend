import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { scoresRouter } from './routes/scores.js'

const app = express()
const PORT = process.env.PORT || 3001

// --- Allowed origins ---
// In production, restrict this to your deployed frontend domain.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

// --- Security headers ---
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  )
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

// --- CORS (strict, no wildcard) ---
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman) only in dev
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed.`))
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
  })
)

// --- Body parsing (limit payload size to prevent DoS) ---
app.use(express.json({ limit: '16kb' }))

// --- Routes ---
app.use('/api/scores', scoresRouter)

// --- Health check ---
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// --- Catch-all for undefined routes ---
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }))

// --- Central error handler (never leaks stack traces to client) ---
app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Punching Machine API listening on http://127.0.0.1:${PORT}`)
})
