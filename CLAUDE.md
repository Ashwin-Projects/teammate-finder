# Competition Teammate Finder — Claude Project Context

## 1. Project Overview
* **Name**: Competition Teammate Finder (DevMatch AI)
* **Problem**: Participants in hackathons, coding competitions, and ideathons struggle to quickly find complementary, credible, and available teammates who will actually participate.
* **Target Users**: Students, software developers, designers, data scientists, and AI engineers forming teams for competitive events.
* **Core Differentiator**: Team-aware, explainable teammate recommendations based on explicit team skill gaps, availability, and reliability, rather than generic user-to-user similarity matching.

## 2. Product Vision
The final platform guides participants through an end-to-end competition team lifecycle:
```
Competition Context
    ↓
Team Formation & Definition
    ↓
Team Requirements / Missing Roles
    ↓
Candidate Pool Selection
    ↓
Team-Aware Cold-Start Matching (v2)
    ↓
Explainable Recommendation (reasons + attribution scoreVersion)
    ↓
Controlled Team Invitation Workflow
    ↓
Team Formation & Workspace
    ↓
Realtime Team Collaboration (Socket.io + persisted messages)
    ↓
Competition Outcome Recording
    ↓
Recommendation Feedback Loop (Impression -> Open -> Invite -> Accept -> Outcome)
```

## 3. Current Repository Status
**AN INITIAL FULL-STACK PROTOTYPE BEING CLEANED AND PREPARED FOR THE PRODUCTION-ORIENTED MVP.**

The repository currently contains a working prototype with basic JWT authentication, profile creation, baseline cosine similarity matching, team creation, basic Socket.io chat, and AI summary generation. It has been audited, cleaned of obsolete files, and configured for systematic phase-by-phase implementation.

## 4. Current Tech Stack

### CURRENTLY USED
* **Frontend**: React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Zustand 5, Framer Motion 12, Lucide React / Material Symbols
* **Backend**: Node.js, Express 4
* **Database & ORM**: PostgreSQL, Prisma ORM 5
* **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
* **Realtime**: Socket.io 4 (single-instance memory adapter)
* **AI Integration**: OpenAI SDK (`gpt-3.5-turbo` for profile/team summaries), OpenRouter API (`meta-llama/llama-3.1-8b-instruct:free` for team suggestions with local fallback)

### PLANNED / FUTURE
* **Database Models**: `Competition`, `CompetitionMember`, `TeamRequirement`, `TeamInvite`, `Recommendation`, `RecommendationEvent`, `CompetitionOutcome`, `Report`, `Block`, `ModerationAction`, `PasswordResetToken`, `Notification`
* **Realtime Scaling**: `@socket.io/redis-adapter` for multi-instance backend clusters
* **Auth & Privacy**: Email verification tokens, password reset workflow, cookie-based token storage, rate-limiting middleware, user data export/deletion cascade handling
* **Matching Engine v2**: Multi-dimensional scoring (Skill fit 30%, Role complementarity 25%, Competition fit 15%, Availability 10%, Experience 10%, Reliability 10%) with human-readable match explanations

## 5. Completed Features
* **Authentication**: Signup (`POST /api/auth/signup`), Login (`POST /api/auth/login`), Fetch Current User (`GET /api/auth/me`).
* **Competition Management (Phase 1)**: Status lifecycle helper (`isValidStatusTransition`), List Competitions (`GET /api/competitions`), Get Competition (`GET /api/competitions/:id`), Create Competition (`POST /api/competitions` [Admin]), Update Competition (`PUT /api/competitions/:id` [Admin]), Update Status (`PATCH /api/competitions/:id/status` [Admin]).
* **Profile System**: Fetch Profile (`GET /api/profile`), Upsert Profile (`PUT /api/profile`), Fetch Profile by User ID (`GET /api/profile/:userId`), AI Profile Summary Generation (`POST /api/profile/generate-summary`).
* **Baseline Matching Engine**: Find top matches using binary vector cosine similarity (`GET /api/match/find`), Calculate pair score (`GET /api/match/user/:userId`).
* **Team Management**: List User Teams (`GET /api/team`), Get Team Details (`GET /api/team/:teamId`), Create Team (`POST /api/team`), Add Team Member (`POST /api/team/:teamId/members`), Remove Member (`DELETE /api/team/:teamId/members/:userId`), Update Team (`PUT /api/team/:teamId`), Delete Team (`DELETE /api/team/:teamId`).
* **Realtime Chat**: Fetch Chat History (`GET /api/chat/:teamId`), Delete Message (`DELETE /api/chat/:messageId`), Socket.io room joins (`join_team`) and live message broadcasting (`send_message`, `receive_message`).
* **AI Utilities**: Generate Team Suggestion (`POST /api/ai/generate-team`), Save Suggestion (`POST /api/suggestions/save`), Fetch Saved Suggestions (`GET /api/suggestions`).
* **Frontend Pages**: Landing (`/`), Login (`/login`), Signup (`/signup`), Teammate Finder Dashboard (`/dashboard`), Profile (`/profile`), Collaboration Messages Room (`/messages`), Settings & AI Suggestion Hub (`/settings`).

## 6. Partially Implemented Features
* **Invitation Workflow**: Current system allows immediate admin addition of members (`POST /api/team/:teamId/members`) without a formal `pending -> accepted/rejected` invitation flow (`TeamInvite`).
* **Matching Explainability**: Current matcher returns percentage scores based on skill/interest/competition overlap but does not yet generate structured human-readable reason strings (e.g. "Fills your ML gap").
* **Authentication Lifecycle**: Basic JWT & password hashing exists, but lacks email verification, password reset tokens, rate limiting, and cookie-based session protection.
* **AI Hardening**: Basic try/catch fallbacks exist, but caching on profile model is simple string storage; lacks rate-limiting, usage cost logging, and timeout wrappers.
* **Realtime Authorization**: Socket server handles room joins and messages, but does not verify socket handshakes or authorize room membership server-side.

## 7. Current Database Schema (Prisma)
The database schema (`backend/prisma/schema.prisma`) consists of the following models:

```prisma
enum CompetitionStatus {
  DRAFT
  PENDING
  APPROVED
  ACTIVE
  COMPLETED
  ARCHIVED
}

model User {
  id                  String              @id @default(uuid())
  email               String              @unique
  name                String
  passwordHash        String
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  profile             Profile?
  sentMessages        Message[]
  teamMembers         TeamMember[]
  savedSuggestions    SavedSuggestion[]
  createdCompetitions Competition[]       @relation("CreatedCompetitions")
  competitionMembers  CompetitionMember[]
}

model Profile {
  id                  String              @id @default(uuid())
  userId              String              @unique
  bio                 String?
  skills              String[]
  interests           String[]
  competitions        String[]
  summary             String?
  availability        String?
  experienceLevel     String?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Competition {
  id              String              @id @default(uuid())
  name            String
  description     String?
  organizer       String?
  startDate       DateTime?
  endDate         DateTime?
  maxTeamSize     Int                 @default(4)
  requiredSkills  String[]            @default([])
  status          CompetitionStatus   @default(DRAFT)
  createdByUserId String?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  createdByUser   User?               @relation("CreatedCompetitions", fields: [createdByUserId], references: [id], onDelete: SetNull)
  teams           Team[]
  members         CompetitionMember[]
}

model CompetitionMember {
  id            String      @id @default(uuid())
  competitionId String
  userId        String
  joinedAt      DateTime    @default(now())
  competition   Competition @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([competitionId, userId])
}

model Team {
  id            String       @id @default(uuid())
  name          String
  description   String?
  summary       String?
  competitionId String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  competition   Competition? @relation(fields: [competitionId], references: [id], onDelete: SetNull)
  members       TeamMember[]
  messages      Message[]
}

model TeamMember {
  id                  String              @id @default(uuid())
  teamId              String
  userId              String
  role                String              @default("member")
  joinedAt            DateTime            @default(now())
  team                Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user                User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([teamId, userId])
}

model Message {
  id                  String              @id @default(uuid())
  teamId              String
  senderId            String
  content             String
  createdAt           DateTime            @default(now())
  team                Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  sender              User                @relation(fields: [senderId], references: [id], onDelete: Cascade)
}

model SavedSuggestion {
  id                     String           @id @default(uuid())
  userId                 String
  competitionDescription String
  generatedResponse      Json
  createdAt              DateTime         @default(now())
  user                   User             @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 8. Current Matching Algorithm (Baseline)
* **Location**: `backend/utils/matching.js`
* **Inputs**: Current user profile (`skills`, `interests`, `competitions`), candidate user profiles pool.
* **Vector Construction**: Builds binary presence/absence vectors (`skillsToVector`) over all unique skills, interests, and competition categories across users.
* **Similarity Calculation**: Cosine similarity (`dotProduct / (magA * magB)`).
* **Weights**:
  * Skill similarity: 50%
  * Interest similarity: 25%
  * Competition category similarity: 25%
* **API Endpoint**: `GET /api/match/find?limit=10`
* **Limitations**: User-to-user similarity match only. Does not account for missing team role gaps, specific competition entities, availability time slots, or past reliability.

## 9. Current API Structure
* **`POST /api/auth/signup`**: Create user account & return JWT.
* **`POST /api/auth/login`**: Authenticate credentials & return JWT.
* **`GET /api/auth/me`**: Get current user identity & profile.
* **`GET /api/competitions`**: List competitions with optional status/search filters.
* **`GET /api/competitions/:id`**: Get single competition details.
* **`POST /api/competitions`**: Create competition (Admin only).
* **`PUT /api/competitions/:id`**: Update competition details & status (Admin only).
* **`PATCH /api/competitions/:id/status`**: Update competition status (Admin only).
* **`GET /api/profile`**: Get current user's profile.
* **`PUT /api/profile`**: Create/update current user's profile.
* **`GET /api/profile/:userId`**: Public profile lookup by user ID.
* **`POST /api/profile/generate-summary`**: Trigger AI summary for profile.
* **`GET /api/match/find`**: Find matching candidate profiles.
* **`GET /api/match/user/:userId`**: Get candidate profile and calculated match score with caller.
* **`GET /api/team`**: Get all teams joined by caller.
* **`GET /api/team/:teamId`**: Get team details (members & profiles).
* **`POST /api/team`**: Create new team (caller becomes `admin`).
* **`POST /api/team/:teamId/members`**: Add user to team (admin only).
* **`DELETE /api/team/:teamId/members/:userId`**: Remove user from team.
* **`PUT /api/team/:teamId`**: Update team name/description.
* **`DELETE /api/team/:teamId`**: Delete team.
* **`GET /api/chat/:teamId`**: Fetch message history for team.
* **`DELETE /api/chat/:messageId`**: Delete a chat message.
* **`POST /api/ai/generate-team`**: Generate AI team role breakdown.
* **`POST /api/suggestions/save`**: Save AI suggestion to history.
* **`GET /api/suggestions`**: Fetch saved AI suggestions for caller.

## 10. Current Frontend Structure
* **Architecture**: React 19 + TypeScript + Vite single page application with Zustand store (`useStore.ts`) managing client-side state, JWT token storage in `localStorage`, and Socket.io client initialization.
* **Pages**:
  * `Landing.tsx` (`/`): Public product landing page with interactive demo match simulation.
  * `Login.tsx` (`/login`): User authentication login form with quick demo user shortcuts.
  * `Signup.tsx` (`/signup`): User registration form.
  * `Dashboard.tsx` (`/dashboard`): Main teammate finder interface with candidate cards, filtering (skills, experience, availability), match score indicator, match profile sidebar, and invite modal.
  * `Profile.tsx` (`/profile`): User profile view, bio card, AI profile summary display & regeneration trigger, technical stack tags, and hackathon history.
  * `Messages.tsx` (`/messages`): Realtime team channels sidebar, message history, live message input with Socket.io sync, submission countdown timer widget, and team task checklist.
  * `Settings.tsx` (`/settings`): Tabbed settings page for updating developer profile information and running the AI Suggestion Hub.
* **Components**: `Layout.tsx` (sidebar & top bar navigation wrapper), `ui/button.tsx`, `ui/card.tsx`, `ui/dialog.tsx`, `ui/input.tsx`.

## 11. Current Realtime Architecture
* **Server Setup**: `backend/server.js` initializes `socket.io` Server instance attached to HTTP server.
* **Room Behavior**: Clients join room named after `teamId` via `join_team` event.
* **Message Handling**: `send_message` receives `{ teamId, senderId, content, senderName }`, persists `Message` in PostgreSQL via Prisma, and broadcasts `receive_message` to room `teamId`.
* **Known Authorization Gaps**:
  * Socket handshake does not verify JWT.
  * `join_team` does not check if user is a member of `teamId` in PostgreSQL.
  * `send_message` relies on client-provided `senderId` without server validation.

## 12. Current AI Architecture
* **Providers**: OpenAI SDK (`backend/utils/openai.js`) using `process.env.OPENAI_API_KEY` (`gpt-3.5-turbo`) and OpenRouter API client using `process.env.OPENROUTER_API_KEY` (`meta-llama/llama-3.1-8b-instruct:free`).
* **Profile Summarization**: `generateProfileSummary(profile)` produces concise 2-sentence summaries. Falls back to static string stringification if OpenAI is unconfigured or fails.
* **Team Summarization**: `generateTeamSummary(team)` generates motivating team descriptions based on member skills.
* **Team Suggestions**: `generateTeamSuggestion(input)` outputs JSON crew configurations. Falls back to `getFallbackTeamSuggestion(input)` deterministically.
* **Caching & Cost Controls**: Summary string stored on `Profile.summary` & `Team.summary`. Caching invalidation, cost tracking logs, and request rate-limiting are not yet implemented.

## 13. Cleanup Completed (Session Record)
* **Files Deleted**:
  * `src/styles/dark-theme.css` (Obsolete root directory containing single unused CSS file).
  * `package-lock.json` (Unused 7-line lockfile in root directory).
  * `frontend/src/assets/react.svg` & `frontend/src/assets/vite.svg` (Unused Vite starter assets).
  * `frontend/src/favicon.svg` (Duplicate favicon).
* **Files Created**:
  * `backend/.env.example` (Standard backend environment template).
  * `CLAUDE.md` (Root project handoff and architecture record).
* **Files Modified**:
  * `frontend/index.html` (Updated favicon link to `/favicon.svg`).
  * `README.md` (Corrected misleading feature claims, fixed command documentation, updated directory tree, and added explicit PLANNED markers for future features).
* **Environment & Security**:
  * Verified `.gitignore` covers `.env` files.
  * Identified committed database credentials in local `backend/.env` for rotation before production.

## 14. Known Technical Debt
1. **Matching Engine Limitations**: Current baseline matches user similarity (Cosine similarity), not team role gaps or competition requirements.
2. **Missing Competition Entity**: Competitions exist only as string arrays on user profiles, not as first-class entities (`Competition`).
3. **Invitation Workflow**: Member addition bypasses formal `pending -> accept/reject` state machine (`TeamInvite`).
4. **Realtime Security Gaps**: Socket.io connections and room joins lack server-side JWT authentication and team membership authorization checks.
5. **Realtime Scaling**: Socket.io uses in-memory adapter; requires Redis adapter (`@socket.io/redis-adapter`) for multi-instance deployment.
6. **Authentication Completeness**: Email verification and password reset workflows are not implemented.
7. **AI Cost & Rate Control**: Lack of rate-limiting middleware, token usage logging, and request timeout bounds on AI endpoints.
8. **TypeScript & Lint Warnings**: Frontend codebase contains 58 `@typescript-eslint/no-explicit-any` type warnings and minor unused error bindings.

## 15. Future Architecture (Target State from PDF)

### P0 (Core Foundation & Production Gate)
* `Competition` & `CompetitionMember` data models.
* `TeamRequirement` & `TeamInvite` controlled workflow.
* Cold-start team-aware v2 matcher with deterministic fallback.
* Recommendation attribution tracking (`Recommendation`, `RecommendationEvent`, `scoreVersion`).
* Safety Layer (`Report`, `Block`, `ModerationAction`, rate-limiting, room authorization).
* Auth & Privacy completion (email verification, password reset, account deletion rules).

### P1 (Product Polish & Trust)
* Candidate quality & trust indicators (portfolio links, activity/reliability indicators).
* AI cost/latency controls (caching, invalidation, timeout, usage logging).
* Socket authorization & Redis adapter readiness.
* UI polish (empty/loading states, accessibility, responsive polish).

### P2 (Advanced Evolution)
* ML ranking experiments & embedding-based matching (after outcome data volume exists).

## 16. Development Roadmap

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Repository cleanup, env hygiene, documentation, baseline verification | **COMPLETED** |
| **Phase 1** | Competition core — `Competition` model, admin curation, competition context onboarding | **IN PROGRESS** |
| **Phase 2** | Matching core — `TeamRequirement`, cold-start matcher, weighted scoring, explanations | **NOT STARTED** |
| **Phase 3** | Feedback loop — `Recommendation` IDs, event schema, score versions, funnel analytics | **NOT STARTED** |
| **Phase 4** | Safety layer — `Report`, `Block`, moderation queue, message/invite limits | **NOT STARTED** |
| **Phase 5** | Auth + privacy — email verification, password reset, retention rules, visibility controls | **NOT STARTED** |
| **Phase 6** | Trust layer — portfolio, availability, activity/reliability indicators | **NOT STARTED** |
| **Phase 7** | AI hardening — caching, invalidation, rate limits, timeouts, fallback, usage logs | **NOT STARTED** |
| **Phase 8** | Realtime hardening — Socket authorization, message persistence, Redis adapter readiness | **NOT STARTED** |
| **Phase 9** | Product polish — responsive UI, loading/error/empty states, accessibility | **NOT STARTED** |
| **Phase 10** | Ship + measure — CI/CD deployment, monitoring, analytics review | **NOT STARTED** |
| **Phase 11** | ML evolution — embeddings & ML ranking (post-launch outcome data) | **NOT STARTED** |

## 17. Rules for Future AI Coding Sessions
1. **Read CLAUDE.md before modifying code.**
2. **Read the relevant section of the product specification PDF before implementing major features.**
3. **Inspect existing code before creating new files.**
4. **Never assume planned features already exist.**
5. **Never rebuild working functionality without a validated reason.**
6. **Do not delete code without verifying it is unused.**
7. **Keep business logic separated from route handlers where practical.**
8. **Never commit secrets (API keys, JWT secrets, passwords).**
9. **Keep README synchronized with actual implementation.**
10. **Explain schema changes before applying migrations.**
11. **Run lint/build/tests after meaningful changes.**
12. **Prefer incremental changes.**
13. **Do not implement multiple roadmap phases at once.**
14. **Complete and verify one phase before moving to the next.**
15. **Preserve the current baseline matcher until the new matcher is implemented and tested.**
16. **Do not add AI merely for complexity; AI must serve a defined product purpose.**

## 18. NEXT REQUIRED STEP
* **Target Phase**: **Phase 1 — Competition Core**
* **NEXT REQUIRED STEP**: Implement competition discovery UI and competition-aware candidate onboarding selection (`frontend/src/pages/Competitions.tsx` and onboarding profile integration).
* **Status**: Phase 1 — Competition Core: IN PROGRESS.
