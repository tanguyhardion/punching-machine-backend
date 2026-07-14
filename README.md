# punching-machine-backend

Express + Supabase REST API for the [Punching Machine Leaderboard](https://github.com/tanguyhardion/punching-machine).

## API

| Method | Path         | Description                          |
|--------|--------------|--------------------------------------|
| GET    | `/api/scores` | Return all scores (sorted by score ↓) |
| POST   | `/api/scores` | Create a new score entry             |
| GET    | `/health`    | Health check                         |

### POST `/api/scores` body

```json
{
  "player": "Neon Crusher",
  "score": 850,
  "power": "Meteor Smash"
}
```

- `player` — required, string, 1–20 chars
- `score` — required, integer, 1–999
- `power` — optional, string, max 28 chars (defaults to `"Arcade Smash"`)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_create_scores.sql
   ```
3. Copy your **Project URL** and **service_role** key from  
   *Settings → API*.

### 2. Environment

```bash
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### 3. Install & run

```bash
npm install
npm run dev      # development (node --watch)
npm start        # production
```

The server listens on `http://127.0.0.1:3001` by default.

## Security notes

- All credentials are read from environment variables — never from source code.
- CORS is restricted to an allow-list of origins (`ALLOWED_ORIGINS` env var).
- Input validation enforces the same constraints as the database `CHECK` clauses.
- Row Level Security is enabled on the `scores` table; direct client access is denied.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`, `Permissions-Policy`) are set on every response.