import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptionsRequest } from '../utils/cors';
import { getSupabaseClient } from '../utils/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (handleOptionsRequest(req, res)) {
    return;
  }

  const supabase = getSupabaseClient();

  // GET - Fetch scores
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('id, player, score, power, created_at')
        .order('score', { ascending: false })
        .limit(200);

      if (error) {
        console.error('[scores] list error:', error.message);
        return res.status(502).json({ error: 'Failed to retrieve scores.' });
      }

      const entries = (data ?? []).map((row: any) => ({
        id: row.id,
        player: row.player,
        score: row.score,
        power: row.power,
        createdAt: row.created_at,
      }));

      return res.status(200).json(entries);
    } catch (err: any) {
      console.error('[scores] handler error:', err.message || err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  // POST - Save new score
  if (req.method === 'POST') {
    // --- Master password check ---
    const masterPassword = process.env.SUBMIT_PASSWORD;
    if (!masterPassword) {
      console.error('[scores] SUBMIT_PASSWORD env var is not set');
      return res.status(500).json({ error: 'Server misconfiguration.' });
    }
    const provided = req.headers['x-submit-password'];
    if (!provided || provided !== masterPassword) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or missing password.' });
    }
    // --- End password check ---

    try {
      const { player, score, power } = req.body ?? {};

      // Input validation
      if (typeof player !== 'string' || player.trim().length === 0 || player.trim().length > 20) {
        return res.status(400).json({ error: 'player must be a non-empty string (max 20 chars).' });
      }

      const parsedScore = Number(score);
      if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 999) {
        return res.status(400).json({ error: 'score must be an integer between 1 and 999.' });
      }

      const sanitizedPower =
        typeof power === 'string' && power.trim().length > 0
          ? power.trim().slice(0, 28)
          : 'Arcade Smash';

      const { data, error } = await supabase
        .from('scores')
        .insert({
          player: player.trim(),
          score: parsedScore,
          power: sanitizedPower,
        })
        .select('id, player, score, power, created_at')
        .single();

      if (error) {
        console.error('[scores] insert error:', error.message);
        return res.status(502).json({ error: 'Failed to save score.' });
      }

      return res.status(201).json({
        id: data.id,
        player: data.player,
        score: data.score,
        power: data.power,
        createdAt: data.created_at,
      });
    } catch (err: any) {
      console.error('[scores] handler error:', err.message || err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
