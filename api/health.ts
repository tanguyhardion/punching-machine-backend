import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleOptionsRequest } from '../utils/cors.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (handleOptionsRequest(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({ status: 'ok' });
}
