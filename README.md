# 🏆 Competition Teammate Finder

A full-stack web application to connect users with compatible teammates for competitions using AI-powered matching (cosine similarity), real-time chat (Socket.io), profile summarization (OpenAI GPT), and secure authentication (JWT). Built with React (TypeScript + Tailwind) frontend, Node.js/Express backend, and PostgreSQL database via Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (local or hosted, e.g., via Docker)
- OpenAI API key (for GPT summarization)

### Setup
1. Clone the repo and navigate to the project directory.
2. Copy `.env.example` to `.env` and fill in values:
   ```
   DB_URL="postgresql://user:password@localhost:5432/teammatefinder?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   OPENAI_API_KEY="sk-your-openai-key"
   PORT=5000
   CLIENT_URL="http://localhost:3000"
   ```
3. **Backend Setup:**
   ```
   cd backend
   npm install
   npx prisma generate
   npx prisma db push  # Or migrate for production
   node server.js
   ```
4. **Frontend Setup:**
   ```
   cd frontend
   npm install
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup (Local PostgreSQL via Docker)
If no local DB:
```
docker run --name teammate-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=teammatefinder -p 5432:5432 -d postgres
```
Update `DB_URL` accordingly.

### Seeding Data
Run `npx prisma db seed` (seed script in `backend/prisma/seed.js`) for sample users/profiles.

## 🧭 User Journey Overview

1. User visits the app (React frontend) → signs up or logs in.
2. Frontend (React) sends login/signup data → Backend (Express) via REST API.
3. Backend authenticates (JWT) → issues token → stored in localStorage.
4. User creates or updates profile with skills, interests, competition preferences.
5. AI layer (Cosine similarity) auto-suggests teammates with compatible skills.
6. User can view, invite, or chat with matched teammates (Socket.io real-time).
7. GPT summarization can generate short bios or team descriptions.
8. Teams can form, chat, and prepare for competitions together.

## ⚙️ Frontend (React + TypeScript + Tailwind)

- **UI Components:** SignUp/Login, Profile Page, Teammate Finder, Chat, Dashboard.
- **State Management:** Zustand for user session and team data.
- **API Calls:**
  - `fetch("/api/auth/login")` → authenticate
  - `fetch("/api/match/find")` → get AI-matched teammates
  - `socket.emit("message")` → send team chat messages
- **Handles:**
  - JWT in headers for secure calls
  - WebSocket connection for real-time updates
  - Displaying AI summaries and suggestions

## 🌐 Backend (Node.js + Express)

### Core API Routes
- `/api/auth/signup` → Create new user → PostgreSQL (users)
- `/api/auth/login` → Authenticate user, issue JWT → PostgreSQL
- `/api/profile` → CRUD user profiles, skills → Prisma ORM
- `/api/match/find` → AI teammate matching → Cosine similarity engine
- `/api/team/create` → Form a new team → PostgreSQL (teams)
- `/api/chat` → Fetch message history → PostgreSQL (messages)

### Middleware
- **JWT Verification:** Authenticates protected routes.
- **CORS:** Allows frontend to access backend from different domain.
- **Error Handler:** Unified error responses.

## 🧠 AI / ML Layer

**Goal:** Smart teammate recommendation + profile summarization.

### Matching (Cosine Similarity) 🔍
- Extract user skill vectors (e.g., from selected skills or text embeddings).
- Compute **cosine similarity** between users’ vectors.
- Return top N most compatible teammates.

### Summarization (GPT API) 🤖
- When users write long bios, the backend can call GPT to:
  - Generate short summaries (e.g., “Tech-savvy problem solver skilled in AI and ML”).
  - Help refine team descriptions.

## 💾 Database (PostgreSQL + Prisma)

### Key Tables
- **Users:** id, name, email, passwordHash
- **Profiles:** userId, skills[], bio, competitions[], summary
- **Teams:** id, name, members[]
- **Messages:** id, teamId, senderId, content, timestamp

### Prisma ORM
- Schema defines relations → generates TypeScript client.
- Used in Express routes for CRUD operations.
- Ensures type-safe DB access.

## 🔐 Authentication (JWT)

1. On login/signup → backend creates JWT with user ID.
2. Frontend stores it in localStorage or cookies.
3. Every API request includes `Authorization: Bearer <token>`.
4. Express verifies JWT to identify user.

## 💬 Real-Time Layer (Socket.io)

- **Connection:** Frontend connects via `io(backendURL, { auth: { token } })`.
- **Features:**
  - Real-time team chat
  - Online/offline presence updates
  - Live teammate invitations
- **Events:**
  - `message` → broadcast chat messages
  - `team_update` → notify members when someone joins/leaves

## 🔗 System Diagram

```
[ React Frontend (Vercel) ]
       ↓ (fetch, WebSocket)
[ Express Backend (Railway) ]
       ↓
[ Prisma ORM ]
       ↓
[ PostgreSQL Database ]
       ↑
[ AI Layer: GPT + Cosine Similarity ]
       ↕
[ Socket.io for Realtime Chat ]
```

## 🔁 End-to-End Flow Example

1. **User A** signs up → profile saved → token issued.
2. **User B** signs up with overlapping skills.
3. `/api/match/find` runs cosine similarity → finds A ↔ B match.
4. Both users see each other as suggestions on dashboard.
5. User A invites User B → `Socket.io` sends notification.
6. They chat in real time.
7. GPT generates a “Team Summary” → stored in team profile.
8. Team is saved to DB → visible on both dashboards.

## 🌍 Deployment

| Layer          | Platform                            | Notes                                            |
| -------------- | ----------------------------------- | ------------------------------------------------ |
| **Frontend**   | Vercel                              | Build React app → uses production API endpoint   |
| **Backend**    | Railway                             | Node + Express server with PostgreSQL connection |
| **Database**   | Railway / Supabase                  | Hosted PostgreSQL                                |
| **AI Keys**    | Stored as ENV vars                  | `OPENAI_API_KEY`, etc.                           |
| **CORS Setup** | Allow Vercel domain to call backend | `origin: "https://teammatefinder.vercel.app"`    |

## 📝 Contributing

- Fork the repo and create a feature branch.
- Install dependencies and run locally.
- Submit PRs with clear descriptions.

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

*Built with ❤️ for competitive spirits!*
