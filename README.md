# Competition Teammate Finder (DevMatch AI)

A full-stack competition team-formation platform designed to help hackathon and competition participants find **complementary, credible, and available** teammates through explainable, team-aware recommendations.

> Find people who *complete* your team, not people who look like you.

---

## Current Status

This repository is currently an **initial full-stack prototype being cleaned and prepared for the production-oriented MVP**.

* **Phase 0 (Repository Audit & Cleanup)**: COMPLETED.
* **Handoff & Project Context**: See [`CLAUDE.md`](CLAUDE.md) for full project state, technical debt, and execution rules.
* **Product Specification**: See `Competition_Teammate_Finder_Revised_Master_Plan.pdf` for the product roadmap, data models, and safety requirements.

---

## Tech Stack

### Currently Implemented
| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + Zustand 5 + Framer Motion |
| Backend | Node.js + Express 4 |
| Database | PostgreSQL + Prisma ORM 5 |
| Auth | JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`) |
| Realtime | Socket.io 4 (single-instance server) |
| AI | OpenAI (`gpt-3.5-turbo`) + OpenRouter (`meta-llama/llama-3.1-8b-instruct:free`) |
| Matching | Cosine similarity baseline algorithm (skills 50%, interests 25%, competitions 25%) |

### Planned / Future Roadmap
| Layer | Technology / Feature |
|---|---|
| Domain Models | Competition, CompetitionMember, TeamRequirement, TeamInvite, Recommendation, Moderation |
| Matching v2 | Team-aware cold-start matcher with role complementarity & score versioning |
| Auth Hardening | Email verification tokens, password reset workflow, cookie-based sessions, rate limiting |
| Realtime Scaling | Redis adapter (`@socket.io/redis-adapter`) & server-side socket room authorization |
| Safety Layer | Report & block user workflow, moderation queue, invite rate limits |

---

## Quick Start & Local Setup

### Prerequisites
* Node.js (v18+)
* PostgreSQL database (local installation, Neon, or Docker)
* OpenAI / OpenRouter API Key (Optional for AI summaries)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
```

Configure `backend/.env` with your database URL and JWT secret:
```env
PORT=5000
CORS_ORIGIN="http://localhost:3000"
DB_URL="postgresql://username:password@localhost:5432/teammatefinder?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/teammatefinder?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="sk-your-openai-api-key"
```

Initialize database & seed mock data:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

Start the backend server:
```bash
npm run dev
# or: npm start
```
Backend runs on `http://localhost:5000`.

### 2. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend dev server runs on `http://localhost:3000`.

---

## Project Structure

```
competition-teammate-finder/
├── CLAUDE.md                    # Main AI context & handoff documentation
├── README.md                    # Project quick start & state
├── Competition_Teammate_Finder_Revised_Master_Plan.pdf # Master product spec
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js               # Express + Socket.io entry point
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── admin.js            # Admin role authorization middleware
│   ├── services/
│   │   └── competition.service.js # Competition domain service & status lifecycle helper
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data models (User, Profile, Competition, Team, etc.)
│   │   └── seed.js             # Seed database script
│   ├── routes/
│   │   ├── auth.js             # Signup, login, current user endpoints
│   │   ├── competition.js      # Competition CRUD & status lifecycle management
│   │   ├── profile.js          # Profile lookup, update, summary generation
│   │   ├── match.js            # Baseline similarity matching
│   │   ├── team.js             # Team CRUD & membership operations
│   │   ├── chat.js             # Chat history REST endpoints
│   │   ├── ai.js               # AI team suggestion generator
│   │   └── suggestions.js      # Saved AI suggestions
│   └── utils/
│       ├── matching.js         # Cosine similarity vector matching logic
│       └── openai.js           # OpenAI & OpenRouter integration
└── frontend/
    ├── package.json
    ├── vite.config.ts          # Vite configuration & proxy routes
    ├── index.html
    └── src/
        ├── App.tsx             # React router & protected route wrappers
        ├── main.tsx
        ├── store/
        │   └── useStore.ts     # Zustand global store & Socket.io client handlers
        ├── components/
        │   ├── Layout.tsx      # Sidebar & top navigation layout
        │   └── ui/             # Reusable UI components (button, card, dialog, input)
        └── pages/
            ├── Landing.tsx     # Public landing page with demo sandbox
            ├── Login.tsx       # Sign in page
            ├── Signup.tsx      # Sign up page
            ├── Dashboard.tsx   # Teammate Finder matching list & profile inspector
            ├── Profile.tsx     # User profile page
            ├── Messages.tsx    # Realtime team collaboration channels & chat
            └── Settings.tsx   # Profile editing & AI Suggestion Hub
```

---

## Development & Testing Commands

### Backend Commands
```bash
npm run dev            # Start backend with nodemon
npm start              # Start backend with node
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run seed           # Seed sample users and teams
```

### Frontend Commands
```bash
npm run dev            # Start Vite development server
npm run build          # Typecheck & build production bundle
npm run lint           # Run ESLint analysis
npm run preview        # Preview production build locally
```

---

## License
MIT — see `LICENSE` for details.
