# Competition Teammate Finder

A full-stack platform that helps participants form **complementary, credible, and available** teams for hackathons and other competitions — through explainable, team-aware recommendations rather than plain similarity matching.

> Find people who *complete* your team, not people who look like you.

---

## Status

This repository is being refined from an initial full-stack prototype into a focused, production-oriented MVP. See [`docs/product.md`](docs/product.md) for the full product, architecture, safety, and execution plan. This README covers what's needed to run and understand the project day-to-day.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind + Zustand + React Router |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt (+ email verification, password reset) |
| Realtime | Socket.io (Redis adapter planned for multi-instance scaling) |
| AI | OpenAI — profile/team summarization, cached and fallback-safe |
| Matching | Deterministic, explainable weighted scoring with a cold-start mode |

---

## Core Idea

1. **Discover** — pick a curated competition.
2. **Onboard** — declare skills, role, experience, availability, interests, portfolio.
3. **Define team gap** — state what the team still needs.
4. **Match** — get ranked, *explained* candidate recommendations ("Fills your ML gap", "Availability overlaps").
5. **Trust** — inspect profile evidence and reliability signals before inviting.
6. **Invite** — send a controlled invite (pending/accepted/rejected).
7. **Collaborate** — realtime team chat, authorized per team membership.
8. **Complete** — record participation outcome, feeding the feedback loop.

**Explicitly out of scope for v1:** general social feed, swipe-style discovery, freelancer marketplace, autonomous AI team formation, large-scale competition scraping.

---

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL (local or via Docker)
- OpenAI API key

### 1. Clone & configure
```bash
git clone <repo-url>
cd competition-teammate-finder
cp .env.example .env
```

Fill in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/teammatefinder?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="sk-your-openai-key"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

### 2. Database (Docker, optional)
```bash
docker compose up -d
```

### 3. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
node src/server.js
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000`.

---

## Project Structure

```
competition-teammate-finder/
├── frontend/
│   └── src/
│       ├── app/            # router, providers, global config
│       ├── components/     # ui, forms, profile, matching, teams, chat, safety
│       ├── pages/          # Landing, Auth, Onboarding, Competitions, Discover, Teams...
│       ├── hooks/ store/ types/ utils/
├── backend/
│   └── src/
│       ├── routes/ controllers/
│       ├── services/        # auth, competition, matching, team, invitation, moderation, analytics
│       ├── ai/               # client, prompts, summarization, cache
│       ├── matching/         # features, cold-start, scoring, explanations, evaluation
│       ├── analytics/        # events, metrics
│       ├── socket/           # auth, rooms, redis adapter
│       └── server.js
│   └── prisma/ (schema, migrations, seed)
├── docs/
│   ├── product.md      # full plan (this document's source of truth)
│   ├── architecture.md
│   ├── matching.md
│   ├── safety.md
│   ├── privacy.md
│   └── analytics.md
└── .github/workflows/ci.yml
```

---

## Matching Engine

Deterministic and explainable by default — no opaque black-box scoring.

| Signal | Weight (v1) |
|---|---|
| Skill fit | 30% |
| Role complementarity | 25% |
| Competition fit | 15% |
| Availability overlap | 10% |
| Experience fit | 10% |
| Reliability / activity | 10% (zero-weighted at cold start) |

Weights are a versioned hypothesis (`scoreVersion`), not a proven optimum — see [`docs/matching.md`](docs/matching.md) for the evaluation loop.

**Cold start:** with no behavioral history, the system falls back to declared-profile signals only (skills, role, availability, competition fit) rather than withholding recommendations or fabricating reliability data.

---

## Safety

This product connects strangers and provides realtime chat, so safety is a first-class feature:
- Report & block
- Admin moderation queue + suspension/ban
- Rate limits on invites/messages (esp. new accounts)
- Socket.io messages authorized per team membership only

See [`docs/safety.md`](docs/safety.md).

---

## Feedback Loop

Every recommendation gets a stable `recommendationId` + `scoreVersion`, tracked through:

```
recommendation → open → invite_sent → invite_accepted → team_joined → competition_completed
```

This turns "tune the weights later" into something actually measurable. See [`docs/analytics.md`](docs/analytics.md).

---

## Roadmap

| Phase | Focus |
|---|---|
| 0 | Foundation — cleanup, env hygiene, schema, baseline tests |
| 1 | Competition core — admin-curated competitions, onboarding |
| 2 | Matching core — cold start, weighted scoring, explanations |
| 3 | Feedback loop — recommendation IDs, event schema |
| 4 | Safety — report, block, moderation, rate limits |
| 5 | Auth + privacy — verification, reset, deletion policy |
| 6 | Trust layer — portfolio, availability, reliability indicators |
| 7 | AI hardening — caching, fallback, cost control |
| 8 | Realtime hardening — socket auth, Redis adapter |
| 9 | Product polish — responsive UI, empty/error states, accessibility |
| 10 | Ship + measure — CI, deployment, monitoring, demo |
| 11 | ML evolution (P2) — only once real outcome data exists |

Full detail, exit criteria, and rationale: [`docs/product.md`](docs/product.md).

---

## Contributing

1. Fork the repo and create a feature branch.
2. Install dependencies and run locally (see Quick Start).
3. Keep business logic in `services/`, not route handlers.
4. Add tests for matching, auth, and safety-critical flows.
5. Open a PR with a clear description.

---

## License

MIT — see `LICENSE`.
