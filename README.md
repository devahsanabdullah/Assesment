# Number Talk (Node + TypeScript + React + Postgres + Docker Compose)

This project implements the "numbers communication" task with a real **PostgreSQL** database:

- Users register/login.
- Registered users can start a discussion with a starting number.
- Users can reply with operations (`+`, `-`, `*`, `/`) to build a calculation tree.
- Backend stores users and calculation nodes in Postgres.

## Stack

- **Backend**: Node.js, TypeScript, Express, PostgreSQL (`pg` driver), JWT auth.
- **Frontend**: React + TypeScript + Vite (SPA).
- **Database**: Postgres 16 (Docker for local).
- **Docker**: Separate containers for `db`, `server`, and `client` via `docker-compose`.

---

## 1. Run everything locally with Docker

From the project root:

```bash
docker compose build
docker compose up
```

Services:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Postgres: localhost:5432 (user: `app`, password: `password`, db: `numbertalk`)

On first start, Postgres runs `server/sql/init.sql` to create tables:

- `users`
- `calculation_nodes`

Stop containers with `Ctrl+C`, or:

```bash
docker compose down
```

If you want a clean DB, also remove the volume:

```bash
docker compose down -v
```

---

## 2. Run locally without Docker

### 2.1 Start Postgres manually

Create a database `numbertalk` and a user `app` with password `password` (or your own values) and run the SQL from `server/sql/init.sql` once.

Then set:

```bash
export DATABASE_URL="postgres://app:password@localhost:5432/numbertalk"
```

(or the DSN that matches your DB).

### 2.2 Start backend

```bash
cd server
npm install
npm run dev   # http://localhost:4000
```

### 2.3 Start frontend

```bash
cd client
npm install
npm run dev   # usually http://localhost:5173
```

If your API is not on `http://localhost:4000`, run the client with:

```bash
VITE_API_URL="http://your-api-url" npm run dev
```

---

## 3. Deploying backend to Koyeb

1. Push `/server` folder as its own repo (or point Koyeb to this monorepo and set build context to `server`).
2. Koyeb will build using `server/Dockerfile`.
3. In Koyeb, create or connect a Postgres database and set an env variable:

   - `DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME`

4. Also set:

   - `JWT_SECRET=<your-strong-secret>`
   - `NODE_ENV=production`

5. Expose port **4000** for the app in Koyeb.

The backend will connect to Postgres using `DATABASE_URL` (same code as local).

---

## 4. Deploying frontend to Koyeb (or any host)

For the frontend:

1. Push `/client` folder as its own repo.
2. Build with its Dockerfile or with the platform’s Node build.
3. Set env:

   - `VITE_API_URL=https://your-backend-url`

4. The build will bake that API URL into the static bundle.

---

## 5. Endpoints / Protocol

- `POST /api/auth/register` `{ username, password }`
- `POST /api/auth/login` `{ username, password }`
- `GET /api/trees` → list of all calculation nodes (with `createdBy` info)
- `POST /api/trees` (auth) `{ value: number }` → create root node
- `POST /api/trees/:parentId/operations` (auth) `{ op: 'add'|'sub'|'mul'|'div', rightValue: number }` → create child node

The frontend is a single-page tree UI similar to a comment thread.