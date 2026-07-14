import { Router } from 'express'
import { supabase } from '../db.js'

export const scoresRouter = Router()

// Strict allow-list for column names used in ORDER BY to prevent injection
const ALLOWED_SORT_COLUMNS = new Set(['score', 'created_at'])

// GET /api/scores — returns all scores sorted by score descending
scoresRouter.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id, player, score, power, created_at')
      .order('score', { ascending: false })
      .limit(200)

    if (error) {
      // TODO(security): Log full Supabase error server-side only; never expose it.
      console.error('[scores] list error:', error.message)
      return res.status(502).json({ error: 'Failed to retrieve scores.' })
    }

    // Map snake_case DB column to camelCase expected by the frontend
    const entries = data.map((row) => ({
      id: row.id,
      player: row.player,
      score: row.score,
      power: row.power,
      createdAt: row.created_at,
    }))

    return res.json(entries)
  } catch (err) {
    next(err)
  }
})

// POST /api/scores — validates and inserts a new score
scoresRouter.post('/', async (req, res, next) => {
  try {
    const { player, score, power } = req.body ?? {}

    // --- Input validation (allow-list approach) ---
    if (typeof player !== 'string' || player.trim().length === 0 || player.trim().length > 20) {
      return res.status(400).json({ error: 'player must be a non-empty string (max 20 chars).' })
    }

    const parsedScore = Number(score)
    if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 999) {
      return res.status(400).json({ error: 'score must be an integer between 1 and 999.' })
    }

    const sanitizedPower =
      typeof power === 'string' && power.trim().length > 0
        ? power.trim().slice(0, 28)
        : 'Arcade Smash'

    const { data, error } = await supabase
      .from('scores')
      .insert({
        player: player.trim(),
        score: parsedScore,
        power: sanitizedPower,
      })
      .select('id, player, score, power, created_at')
      .single()

    if (error) {
      console.error('[scores] insert error:', error.message)
      return res.status(502).json({ error: 'Failed to save score.' })
    }

    return res.status(201).json({
      id: data.id,
      player: data.player,
      score: data.score,
      power: data.power,
      createdAt: data.created_at,
    })
  } catch (err) {
    next(err)
  }
})
