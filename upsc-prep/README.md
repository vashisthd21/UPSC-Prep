# UPSC Prelims Mock Practice

A full-stack practice platform for UPSC Civil Services Examination (Prelims, GS
Paper I): topic-wise and full-length mock tests, previous-year-question
practice, custom test generation, a real exam-style test interface, and
analytics computed from actual attempt data.

This repository contains a complete, working application. It is **not**
running anywhere yet — you'll need to provision a MongoDB database and run
both the server and the client yourself (see Installation below).

## Features

- Full-length mocks, subject tests, topic tests, PYQ tests and on-the-fly
  custom tests (pick subject/topic/difficulty/question type/count)
- UPSC-style question formats: MCQ, statement-based, assertion-reason,
  match-the-following, chronology, "how many statements are correct",
  concept/application, and PYQ
- Real exam interface: question palette with 5-state colour coding
  (unvisited / visited / answered / marked for review / answered+review),
  Previous / Save & Next / Mark for Review / Clear Response, a countdown
  timer that survives a refresh (anchored to the server-recorded start
  time) and auto-submits at zero, and a confirm-before-leaving browser guard
- Configurable UPSC marking scheme (default +2 / −0.667), never hard-coded
- Result page, full question-by-question review with explanations,
  bookmarking, and a "report this question" flow
- Analytics: score trend, subject accuracy, topic accuracy, and weak topics
  — all derived from the signed-in user's own submitted attempts, never
  fabricated
- Admin panel: question CRUD, JSON bulk import with validation (valid /
  invalid / duplicate counts), test creation, user management, reported
  questions
- JWT auth with bcrypt password hashing, role-based access (student/admin),
  rate-limited auth routes, Mongo query sanitization, Helmet, CORS
- Dark mode, responsive down to mobile (the question palette becomes a
  bottom sheet on small screens)

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, lucide-react icons,
Recharts, Zustand, React Router, Axios

**Backend:** Node.js, Express, TypeScript, Mongoose, JWT, bcryptjs, Helmet,
express-rate-limit, express-mongo-sanitize

**Database:** MongoDB (MongoDB Atlas recommended for deployment)

## Folder Structure

```
upsc-prep/
  server/
    src/
      config/        # database connection
      controllers/    # request handlers
      middleware/     # auth, error handling
      models/         # Mongoose schemas
      routes/         # Express routers
      services/       # scoring + custom test generation logic
      seed/            # seed script + Modern History question bank
      utils/          # ApiError, ApiResponse, asyncHandler
      app.ts          # Express app (middleware + routes)
      server.ts       # entrypoint (connects DB, starts server)
  client/
    src/
      components/ui/     # Button, Card, Modal, Toast, etc.
      components/shared/  # QuestionPalette, EmptyState, ErrorState
      layouts/            # MainLayout, DashboardLayout, AdminLayout
      pages/public/        # Landing, Login, Register, MockTests, PYQs, Practice, About
      pages/student/       # Dashboard, TestInterface, Result, Review, Bookmarks, History, Analytics, Profile
      pages/admin/         # AdminDashboard, AdminQuestions, AdminTests, AdminUsers, AdminAnalytics
      services/            # one Axios-based module per API resource
      store/                # Zustand auth store (persisted token/user)
      hooks/               # useAuth, useTheme, useTimer
      types/                # shared TypeScript interfaces
```

## Environment Variables

**server/.env** (copy from `server/.env.example`):

```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/upsc-prep
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```

**client/.env** (copy from `client/.env.example`):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation

You'll need Node.js 18+ and a MongoDB connection string (a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster works well).

```bash
# 1. Backend
cd server
cp .env.example .env     # then edit .env with your MongoDB URI and a JWT secret
npm install
npm run seed              # loads 30 Modern History questions + 3 demo tests
                           # creates admin@upscprep.local and student@upscprep.local
                           # (password for both: ChangeMe123!)
npm run dev                # starts the API on http://localhost:5000

# 2. Frontend (in a second terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173 and log in with the seeded demo accounts, or
register a new account (new accounts are created as `student`; promote one
to `admin` from the admin panel using another admin account, or directly in
MongoDB).

## Database Setup

Any MongoDB 6+ instance works — local `mongod` or Atlas. Mongoose creates
collections and indexes automatically on first connection; no manual
migration step is required. Re-running `npm run seed` clears and
re-populates the `questions` and `tests` collections (existing users are
left untouched; it reuses the demo accounts if they already exist).

## Development Commands

| Command (run in `server/` or `client/`) | What it does |
|---|---|
| `npm run dev` | Start in watch mode |
| `npm run build` | Type-check and compile for production |
| `npm run lint` | Run ESLint |
| `npm run seed` *(server only)* | Reset questions/tests and seed demo data |

## Production Build

```bash
# Backend
cd server && npm run build && npm start   # runs dist/server.js

# Frontend
cd client && npm run build                # outputs static files to client/dist
```

## API Overview

All responses follow `{ success, message, data }`. Protected routes expect
`Authorization: Bearer <token>`.

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                       (auth)

GET    /api/questions                     ?subject&topic&difficulty&questionType&isPYQ&year&search&page&limit
GET    /api/questions/facets              distinct subjects/topics/years
GET    /api/questions/:id
POST   /api/questions                     (admin)
PUT    /api/questions/:id                 (admin)
DELETE /api/questions/:id                 (admin, soft delete)
POST   /api/questions/bulk-import         (admin) { questions: [...] }

GET    /api/tests                          ?testType&subject&difficulty&search&page&limit
GET    /api/tests/:id
GET    /api/tests/:id/questions            (auth) answer-stripped, in test order — powers the test UI
POST   /api/tests                           (admin)
PUT    /api/tests/:id                       (admin)
DELETE /api/tests/:id                       (admin, unpublish)
POST   /api/tests/generate                  (auth) build a custom test from criteria

POST   /api/attempts/start                  (auth) { testId } — resumes an in-progress attempt if one exists
GET    /api/attempts/:id                    (auth)
POST   /api/attempts/:id/answer             (auth) save/update one answer
POST   /api/attempts/:id/submit             (auth) scores and finalizes the attempt
GET    /api/attempts/:id/review             (auth) full question-by-question review
GET    /api/attempts/history                 (auth)

GET    /api/analytics/overview               (auth)
GET    /api/analytics/subjects               (auth)
GET    /api/analytics/topics                  (auth) includes weakTopics
GET    /api/analytics/platform                (admin)

GET    /api/bookmarks                         (auth)
POST   /api/bookmarks                         (auth) { questionId }
DELETE /api/bookmarks/:questionId             (auth)

POST   /api/admin/reports                     (auth) { questionId, reason, comment }
GET    /api/admin/reports                     (admin)
PATCH  /api/admin/reports/:id                 (admin) { status }
GET    /api/admin/users                        (admin)
PATCH  /api/admin/users/:id/role               (admin) { role }
DELETE /api/admin/users/:id                    (admin)
```

### Bulk question import schema

`POST /api/questions/bulk-import` body:

```json
{
  "questions": [
    {
      "questionText": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "...",
      "subject": "Modern History",
      "topic": "Mughal Empire",
      "difficulty": "Hard",
      "questionType": "STATEMENT",
      "isPYQ": false
    }
  ]
}
```

A row with `isPYQ: true` **must** include `year` — this is enforced both in
the bulk importer and at the schema level, so a generated practice question
can never be silently mislabelled as a real previous-year question.

## Deployment

- **Frontend → Vercel:** import the `client/` folder as the project root,
  build command `npm run build`, output directory `dist`, and set
  `VITE_API_BASE_URL` to your deployed API's URL.
- **Backend → Render / Railway:** import the `server/` folder, build command
  `npm run build`, start command `npm start`, and set the environment
  variables listed above (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` pointing
  at your Vercel domain, etc).
- **Database → MongoDB Atlas:** create a free cluster, add a database user,
  allow network access from your backend host (or `0.0.0.0/0` for simple
  setups), and use the provided connection string as `MONGODB_URI`.

Remember to update `CLIENT_URL` on the backend and `VITE_API_BASE_URL` on
the frontend once both are deployed, so CORS and API calls resolve
correctly.

## Notes on the seed data

The seed script ships with 30 original Modern History practice questions
spanning every supported question type. None are labelled as PYQ — real
previous-year questions should be added through the admin panel (or bulk
import) with their verified official year, so the PYQ section only ever
shows genuine UPSC questions.

## Scope notes

This is a complete, working implementation of the core product: auth,
question bank, all test types (including custom generation), the full
test-taking engine with configurable UPSC marking, results, review,
bookmarks, history, analytics (including weak-topic detection), and an
admin panel for questions/tests/users/reports. A few of the more exotic
items from a full spec this size — full and polished admin CSV import
(bulk import currently accepts JSON), question search endpoint,
rate-limit tuning for production traffic, and automated tests — are
natural next additions on top of this foundation.
