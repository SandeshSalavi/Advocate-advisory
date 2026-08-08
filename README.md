# Justly Connect — Backend (Express + MySQL)

This replaces Supabase (Postgres + hosted Auth) with a small Express API backed
by MySQL. Supabase let the frontend talk to Postgres directly with an anon key;
MySQL has no equivalent, so this API layer now sits between the frontend and
the database and handles auth (JWT) and profile data.

## 1. Create the database

```bash
mysql -u root -p < schema.sql
```

## 2. Configure environment

```bash
cp .env.example .env
# edit .env with your MySQL credentials and a real JWT_SECRET
```

## 3. Install & run

```bash
npm install
npm run dev   # or: npm start
```

The API listens on `http://localhost:4000` by default.

## Endpoints

- `POST /api/auth/signup` — { email, password, name, role } → { user, token }
- `POST /api/auth/signin` — { email, password } → { user, token }
- `POST /api/auth/signout`
- `GET  /api/auth/session` — validates the bearer token
- `POST /api/auth/reset-password` — stub; wire up an email provider for a real flow
- `GET  /api/profiles/:role/:id` — auth required
- `PATCH /api/profiles/:role/:id` — auth required
- `GET  /api/advocates` — public listing

## Frontend

In the project root, copy `.env.example` to `.env` and set:

```
VITE_API_URL=http://localhost:4000/api
```

The frontend's `src/integrations/mysql/client.ts` talks to this API and
replaces the old `src/integrations/supabase/client.ts`.

## What changed from Supabase

- Auth is now a custom JWT issued by this API (bcrypt-hashed passwords in
  MySQL) instead of Supabase Auth. Tokens are stored in `localStorage` on
  the frontend.
- `advocate_profiles` / `client_profiles` tables are recreated as-is in
  MySQL (`schema.sql`).
- Row Level Security doesn't exist in MySQL, so authorization is enforced
  in the Express routes (`requireAuth` middleware) instead.
- Supabase Storage and Realtime were not actually wired up in this codebase
  (the chat feature used mock data), so there was nothing to migrate there.
  If you add file uploads or live chat later, you'll need to add your own
  storage (e.g. S3) and a websocket layer (e.g. Socket.IO) — MySQL has no
  built-in equivalent.
