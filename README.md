# TaskBoard — Mini Task & Issue Management System

A full-stack task management app with JWT authentication and a drag-and-drop kanban board (To Do / In Progress / Completed). Built for the CEMZO Full Stack Developer assessment (Ref: CEMZO-FS-2026).

## Live Demo

- Frontend (Vercel): https://task-management-system-dun-rho.vercel.app/
- Backend API (Vercel): https://task-management-system-ekib.vercel.app/

> The backend can run on either Render (traditional long-running server) or Vercel (serverless functions) — see [Deployment Instructions](#deployment-instructions) for both.

## Features

- **Authentication** — JWT-based signup/login, bcrypt-hashed passwords, protected routes on both client and server
- **Task CRUD** — create, edit, delete tasks; dedicated status-only update endpoint for board moves
- **Kanban board** — tasks grouped into To Do / In Progress / Completed columns, drag-and-drop to change status (optimistic UI update, auto-reverts on failure)
- **Search & filter** — keyword search across title/description, filter by priority
- **Client-side validation** — React Hook Form on all inputs (signup, login, task form)
- **Delete confirmation** — SweetAlert2 modal before deleting a task (the one irreversible action); create/update run immediately
- **UX polish** — toast notifications, loading states, responsive layout

## Technology Stack

**Frontend:** React 18, Vite, React Router, Axios, Tailwind CSS, React Hook Form, react-hot-toast, SweetAlert2, lucide-react

**Backend:** Node.js (ES Modules), Express, MongoDB + Mongoose, JWT, bcryptjs, helmet, cors, morgan, dotenv

## Architecture

```
Browser (React SPA)
   │  Axios (JWT in Authorization header)
   ▼
Express REST API
   │  Mongoose ODM (cached connection, serverless-safe)
   ▼
MongoDB Atlas
```

The backend follows a layered structure: **routes → validators/middleware → controllers → models**, with a centralized error handler normalizing all errors (validation, duplicate key, cast errors, custom `ApiError`) into a consistent JSON shape. It uses native ES Modules (`import`/`export`) throughout rather than CommonJS.

The frontend keeps all API calls in a `services/` layer, all cross-cutting session state in `AuthContext`, and all task-fetching/mutation logic in the `useTasks` hook, so pages/components stay purely presentational.

### Serverless-safe database connection

`server/config/db.js` caches the Mongoose connection on `global` and verifies `mongoose.connection.readyState` before reusing it. This matters because:
- **Render / local dev**: connects once at boot (`server.js`), like a traditional server.
- **Vercel**: a new function instance can spin up per request, so without caching every request would open a fresh MongoDB connection and quickly exhaust Atlas's connection limit. The `readyState` check also detects connections that went stale while a serverless function was frozen between invocations, and transparently reconnects instead of hanging.

A diagnostic endpoint, `GET /api/health/db`, attempts a real connection and reports success/failure independently of auth/task logic — useful for quickly telling apart a bad `MONGO_URI`, a MongoDB Atlas Network Access block, or an actual code issue.

## Folder Structure

```
cemzo-task-manager/
├── server/
│   ├── config/          # DB connection (cached, serverless-safe)
│   ├── controllers/      # Request handlers (auth, tasks)
│   ├── middlewares/       # JWT auth guard, centralized error handler
│   ├── models/           # Mongoose schemas (User, Task)
│   ├── routes/           # Express routers
│   ├── validators/        # Request body validation
│   ├── utils/             # ApiError, asyncHandler
│   ├── app.js             # Express app config (exported for Vercel's zero-config detection)
│   ├── server.js          # Entry point for local dev / Render (app.listen)
│   └── .env.example
├── client/
│   └── src/
│       ├── pages/          # LoginPage, SignupPage, DashboardPage, NotFoundPage
│       ├── components/     # TaskCard, TaskColumn, TaskForm, FilterBar, Navbar, PriorityBadge
│       ├── layouts/        # DashboardLayout
│       ├── context/        # AuthContext
│       ├── hooks/          # useAuth, useTasks, useDebounce
│       ├── services/       # api.js, authService.js, taskService.js
│       ├── utils/          # confirmDelete.js (SweetAlert2)
│       ├── routes/         # ProtectedRoute
│       └── constants/
└── render.yaml            # Render Blueprint (backend)
```

## Database Design

**User**

| Field | Type | Notes |
|---|---|---|
| name | String | required, 2–60 chars |
| email | String | required, unique, indexed |
| password | String | required, bcrypt-hashed, `select: false` (never returned by default) |
| createdAt / updatedAt | Date | timestamps |

**Task**

| Field | Type | Notes |
|---|---|---|
| title | String | required, max 120 chars |
| description | String | optional, max 2000 chars |
| status | Enum: `todo`, `in-progress`, `completed` | indexed, default `todo` |
| priority | Enum: `low`, `medium`, `high` | indexed, default `medium` |
| owner | ObjectId → User | required, indexed — every task is scoped to its creator |
| createdAt / updatedAt | Date | timestamps |

Indexes: compound `{ owner: 1, status: 1 }` for the board's main query pattern, plus a text index on `title`/`description` to support search.

## API Documentation

Base URL: `/api`

### Health / Diagnostics

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/health` | Public | Basic liveness check, no DB required |
| GET | `/health/db` | Public | Attempts a real DB connection; reports success or the exact error |

### Auth

| Method | Endpoint | Access | Body |
|---|---|---|---|
| POST | `/auth/signup` | Public | `{ name, email, password }` |
| POST | `/auth/login` | Public | `{ email, password }` |
| GET | `/auth/me` | Private | — |

### Tasks
_All routes require `Authorization: Bearer <token>` and are scoped to the authenticated user._

| Method | Endpoint | Body / Query |
|---|---|---|
| GET | `/tasks?search=&priority=&status=` | — |
| POST | `/tasks` | `{ title, description?, status?, priority? }` |
| PATCH | `/tasks/:id` | any subset of `{ title, description, status, priority }` |
| PATCH | `/tasks/:id/status` | `{ status }` |
| DELETE | `/tasks/:id` | — |

All responses follow `{ success, message?, data }`. Errors follow `{ success: false, message, errors: [] }`.

## Installation Guide

### Prerequisites
- Node.js 18+
- A MongoDB instance (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd cemzo-task-manager

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**server/.env** (copy from `server/.env.example`):

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/task_manager?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

**client/.env** (copy from `client/.env.example`):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run locally

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Frontend: http://localhost:5173  •  API health check: http://localhost:5000/api/health

## Environment Variables Reference

| Variable | Location | Description |
|---|---|---|
| `MONGO_URI` | server | MongoDB Atlas connection string (`mongodb+srv://user:pass@cluster.mongodb.net/dbname`) |
| `JWT_SECRET` | server | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | server | Token lifetime (e.g. `7d`) |
| `CLIENT_ORIGIN` | server | Comma-separated allowed CORS origins (deployed frontend URL) |
| `VITE_API_BASE_URL` | client | Base URL of the backend API, including `/api` |

⚠️ **MongoDB Atlas → Network Access**: must allow the deployment platform's IPs. Since Render's and especially Vercel's outbound IPs are dynamic, add `0.0.0.0/0` (Allow Access from Anywhere) under Network Access.

## Deployment Instructions

The backend can be deployed to **either** Render or Vercel — pick one, or run both.

### Backend → Render (traditional server)
1. Push this repo to GitHub.
2. On Render: **New → Web Service**, connect the repo, set **Root Directory** to `server`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add the environment variables from the table above (`CLIENT_ORIGIN` = your deployed frontend URL). Don't set `PORT` manually — Render injects it automatically.
5. Deploy. A `render.yaml` blueprint is included at the repo root if you prefer Render's Blueprints flow.

### Backend → Vercel (serverless)
1. On Vercel: **New Project**, import the repo, set **Root Directory** to `server`.
2. No build/output overrides needed — Vercel auto-detects `app.js` (it exports the Express app as a default export) with zero configuration.
3. Add the same environment variables as above, minus `PORT` (irrelevant in serverless).
4. Deploy, then verify with `GET /api/health/db` before testing signup/login.

### Frontend → Vercel
1. On Vercel: **New Project**, import the repo, set **Root Directory** to `client`.
2. Framework preset: Vite. Build command: `npm run build` · Output directory: `dist`.
3. Add `VITE_API_BASE_URL` = your deployed backend URL (Render or Vercel) + `/api`.
4. Deploy. (`client/vercel.json` handles SPA client-side routing rewrites.)

Once both are live, update `CLIENT_ORIGIN` on the backend to match your final frontend domain and redeploy.

## Future Improvements

- Pagination/infinite scroll for large task lists
- Task comments and activity history
- Team workspaces with shared boards and role-based permissions
- Refresh tokens instead of a single long-lived JWT
- Automated test suite (Jest + Supertest for API, Vitest + React Testing Library for UI) wired into CI