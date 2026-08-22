# Job Portal

A full-stack **job portal** where job seekers discover roles, manage applications, and get AI-powered career guidance—and recruiters post jobs and manage candidates. Built with a **microservices** backend and a modern **Next.js** frontend.

---

## Features

### For Job Seekers
- **Browse jobs** — Search and filter active job listings
- **Company profiles** — View company details and open positions
- **Apply to jobs** — Submit applications and track status
- **Resume analyzer** — Get ATS-style scores and improvement suggestions
- **AI career guide** — Personalized career path and skill recommendations (powered by Gemini)
- **Account & profile** — Update profile, resume, skills, and subscription

### For Recruiters
- **Post jobs** — Create and update job listings
- **Manage companies** — Create companies and attach jobs
- **Applications** — View and update application status for each job

### Platform
- **Auth** — Register, login, forgot/reset password with email
- **Payments** — Subscription flows via Razorpay
- **File uploads** — Resume and profile images (Cloudinary)
- **Email** — Notifications (Nodemailer)
- **Dark/Light theme** — System-aware theme toggle

---

## Flow structure for SDE role (Job seeker)

End-to-end journey for a Software Development Engineer using the portal:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. LAND & DISCOVER                                                           │
│    /  →  Hero, Career Guide (AI), Resume Analyzer                             │
│    • Explore platform value before signing up                                 │
│    • Get skill-based career suggestions (Gemini)                             │
│    • Check resume ATS score & suggestions                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATE                                                              │
│    /register  →  /login  (or /forgot → /reset/:token)                         │
│    • Register as jobseeker (name, email, password, role, resume optional)     │
│    • Login → JWT stored (cookie); user + isAuth in AppContext                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. PROFILE & READINESS                                                        │
│    /account  →  Info | Skills | Resume | Company (if recruiter)               │
│    • Complete profile: name, phone, bio                                       │
│    • Add/update skills (used for career guide & job match)                    │
│    • Upload/update resume (Cloudinary) for applications                        │
│    • (Optional) /subscribe → Razorpay → premium features                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. FIND SDE JOBS                                                             │
│    /jobs  →  Filter by title (e.g. "SDE", "Software Engineer") & location     │
│    • GET /api/job/all?title=...&location=...                                  │
│    • Browse job cards → click to /jobs/[id]                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. JOB DETAIL & APPLY                                                        │
│    /jobs/[id]  →  Company, role, salary, description                          │
│    • Apply (if not already applied) → creates application record              │
│    • Recruiter view: list applications, update status                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. TRACK APPLICATIONS                                                        │
│    /account  →  Applied jobs tab                                              │
│    • View all applied jobs and status                                         │
│    • Company pages: /company/[id] for more roles at same company               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SDE flow summary

| Step | Route / action        | Service(s)     | Outcome                          |
|------|------------------------|----------------|----------------------------------|
| 1    | `/`                    | Utils (career, resume analysis) | Discover value, AI guidance   |
| 2    | `/register`, `/login`  | Auth           | JWT, session; user in context    |
| 3    | `/account`             | User           | Profile, skills, resume ready    |
| 4    | `/jobs` (filter)       | Job            | List SDE (or other) roles        |
| 5    | `/jobs/[id]` → Apply   | Job            | Application created              |
| 6    | `/account` (Applied)   | Job + User     | Track status; visit company page |

---

## Tech Stack

| Layer        | Technologies |
|-------------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Axios, next-themes |
| **Auth**    | JWT, bcrypt, Redis (session/tokens), Neon (PostgreSQL) |
| **APIs**    | Express 5, TypeScript, CORS |
| **Data**    | Neon (serverless Postgres) |
| **Messaging** | Kafka (KafkaJS) — service-to-service events |
| **Payments** | Razorpay |
| **Storage** | Cloudinary (images, resumes) |
| **AI**      | Google Gemini (career suggestions) |
| **Email**   | Nodemailer |

---

## Architecture

NextHire is a **microservices-based job portal**: one Next.js frontend talks to five independent Express services over REST. Shared data lives in PostgreSQL; email and file/AI work are offloaded via Kafka and a dedicated Utils service.

### System architecture diagram

```mermaid
flowchart TB
    classDef client fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px,color:#e0f2fe
    classDef frontend fill:#431407,stroke:#f97316,stroke-width:2px,color:#ffedd5
    classDef service fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff
    classDef data fill:#14532d,stroke:#4ade80,stroke-width:2px,color:#dcfce7
    classDef external fill:#3f3f46,stroke:#a1a1aa,stroke-width:2px,color:#fafafa

    USERS(["Job Seeker / Recruiter"]):::client

    subgraph L1["PRESENTATION LAYER"]
        direction TB
        FE["Next.js 16 · React 19 · TypeScript<br/><b>:3000</b> · App Router · Tailwind · AppContext"]
        FE_PAGES["/ · /jobs · /account · /career-guide · /subscribe"]
        FE --> FE_PAGES
    end

    subgraph L2["APPLICATION LAYER — Express Microservices"]
        direction LR
        AUTH["<b>Auth</b><br/>:5010<br/>Register · Login<br/>Forgot · Reset · JWT"]:::service
        USER["<b>User</b><br/>:5002<br/>Profile · Skills<br/>Resume · Apply"]:::service
        JOB["<b>Job</b><br/>:5003<br/>Company · Jobs<br/>Applications"]:::service
        PAY["<b>Payment</b><br/>:5004<br/>Checkout<br/>Verify · Subscribe"]:::service
        UTIL["<b>Utils</b><br/>:5001<br/>Upload · AI · Mail<br/>Kafka Consumer"]:::service
    end

    subgraph L3["DATA & MESSAGING LAYER"]
        direction LR
        PG[("PostgreSQL<br/>Neon")]:::data
        REDIS[("Redis<br/>Reset tokens")]:::data
        KAFKA{{"Apache Kafka<br/>topic: send-mail"}}:::data
    end

    subgraph L4["EXTERNAL INTEGRATIONS"]
        direction LR
        CLOUD["Cloudinary<br/>Files & CDN"]:::external
        GEMINI["Google Gemini<br/>Career + ATS AI"]:::external
        RAZOR["Razorpay<br/>Payments"]:::external
        SMTP["Nodemailer<br/>Gmail SMTP"]:::external
    end

    USERS -->|"HTTPS"| FE
    FE -->|"REST · Authorization: Bearer JWT"| AUTH & USER & JOB & PAY & UTIL

    AUTH --> PG
    AUTH --> REDIS
    USER --> PG
    JOB --> PG
    PAY --> PG

    AUTH -->|"Producer"| KAFKA
    JOB -->|"Producer"| KAFKA
    UTIL -->|"Consumer"| KAFKA
    KAFKA -.->|"async email"| SMTP

    AUTH -.->|"resume upload"| UTIL
    USER -.->|"pic / resume"| UTIL
    JOB -.->|"company logo"| UTIL

    UTIL --> CLOUD
    UTIL --> GEMINI
    PAY --> RAZOR

    class FE,FE_PAGES frontend
```

### How to read the diagram

| Layer | What runs here |
|-------|----------------|
| **Presentation** | Browser UI, routing, global auth state (`AppContext`), JWT stored in cookie |
| **Application** | Five stateless Node/Express APIs — each service owns one domain |
| **Data & Messaging** | Single Postgres DB for all services; Redis for password-reset tokens; Kafka for async email |
| **External** | Cloudinary (storage), Gemini (AI), Razorpay (billing), SMTP (notifications) |

### Service map

| Service | Port | Endpoints (summary) | Connects to |
|---------|------|---------------------|-------------|
| **Auth** | `5010` | `/api/auth/register` · `/login` · `/forgot` · `/reset/:token` | Postgres, Redis, Kafka, Utils |
| **User** | `5002` | `/api/user/me` · profile · skills · apply · applications | Postgres, Utils |
| **Job** | `5003` | `/api/job/all` · CRUD jobs/companies · application status | Postgres, Kafka, Utils |
| **Payment** | `5004` | `/api/payment/checkout` · `/verify` | Postgres, Razorpay |
| **Utils** | `5001` | `/api/utils/upload` · `/career` · `/resume-analyser` + mail worker | Cloudinary, Gemini, Kafka, SMTP |

**Communication patterns**

- **Sync (HTTP):** Frontend → any service with `Bearer` token on protected routes
- **Sync (internal):** Auth / User / Job → Utils for file uploads
- **Async (Kafka):** Auth & Job publish `send-mail` → Utils consumes → Nodemailer sends email

---

## Project Structure

```
job-portal/
├── frontend/                 # Next.js app (App Router)
│   ├── src/
│   │   ├── app/              # Routes: /, /jobs, /company, /account, /subscribe, /payment, auth
│   │   ├── components/       # UI, hero, job-card, resume-analyser, carrer-guide, navbar, etc.
│   │   ├── context/          # AppContext (user, auth, API base URLs)
│   │   ├── lib/              # utils
│   │   └── type.ts           # Shared TS types
│   └── package.json
├── services/
│   ├── auth/                 # Register, login, forgot/reset password, JWT, Redis
│   ├── user/                 # User profile, resume, skills, profile pic
│   ├── job/                  # Jobs, companies, applications
│   ├── payment/              # Razorpay subscription & success handling
│   └── utils/                # Cloudinary upload, Gemini career API, email (Kafka consumer)
├── README.md
└── (optional) docker-compose  # If you add one for local run
```

---

## Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Docker** (optional, for Kafka/Redis or full stack)
- **Neon** account (PostgreSQL)
- **Cloudinary** account (uploads)
- **Razorpay** account (payments)
- **Google AI (Gemini)** API key
- **Kafka** (e.g. local or Confluent) for service events
- **Redis** (for auth service)

---

## Environment Variables

Each service and the frontend use `.env` (do not commit secrets). Example shape:

### Frontend (`frontend/.env.local`)

```env
# Point to your backend services (e.g. http://localhost:PORT)
NEXT_PUBLIC_UTILS_SERVICE=http://localhost:5001
NEXT_PUBLIC_AUTH_SERVICE=http://localhost:5010
NEXT_PUBLIC_USER_SERVICE=http://localhost:5002
NEXT_PUBLIC_JOB_SERVICE=http://localhost:5003
NEXT_PUBLIC_PAYMENT_SERVICE=http://localhost:5004
```

### Auth (`services/auth/.env`)

- DB connection (Neon), JWT secret, Redis URL, Kafka brokers, etc.

### User (`services/user/.env`)

- Neon DB, Kafka, JWT/public key or auth service URL for validation

### Job (`services/job/.env`)

- Neon DB, Kafka, auth validation

### Payment (`services/payment/.env`)

- Neon DB, Razorpay key/secret, auth validation

### Utils (`services/utils/.env`)

- Cloudinary credentials, Gemini API key, Kafka (consumer), Nodemailer config

Create `.env` (or `.env.example` without secrets) in each folder and fill values for your environment.

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd job-portal
```

### 2. Run backend services

Each service runs independently. From the repo root:

```bash
# Auth (port 5010)
cd services/auth && npm install && npm run dev

# User (e.g. port 5002)
cd services/user && npm install && npm run dev

# Job (e.g. port 5003)
cd services/job && npm install && npm run dev

# Payment (e.g. port 5004)
cd services/payment && npm install && npm run dev

# Utils (e.g. port 5001) — uploads, career API, email consumer
cd services/utils && npm install && npm run dev
```

Use separate terminals (or a process manager) so all five are running. Ensure Kafka and Redis are up for auth/utils (and any service that publishes/consumes events).

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

**Frontend**

```bash
cd frontend
npm run build
npm start
```

**Services**

```bash
cd services/<service-name>
npm run build
npm start
```

---

## Docker

Each service and the frontend have a `Dockerfile`. Build and run with your own orchestration (e.g. `docker compose`), and ensure Kafka, Redis, and Neon are reachable from the containers. Configure env vars for each service in your compose or deployment.

---

## API Overview

| Service  | Purpose |
|----------|---------|
| **Auth** | `POST /register`, `POST /login`, `POST /forgot`, `POST /reset/:token` |
| **User** | `GET /api/user/me`, update profile, resume, profile pic, skills |
| **Job**  | `GET /all`, `GET /:jobId`, `POST /new`, companies, applications CRUD |
| **Payment** | Create order, verify payment, success callback |
| **Utils** | `POST /upload` (Cloudinary), `POST /career` (Gemini), email via Kafka consumer |

Frontend uses these base URLs from env (or from `AppContext` if set in code). All authenticated requests send `Authorization: Bearer <token>`.

---

## Scripts

| Location     | Command      | Description        |
|-------------|-------------|--------------------|
| Frontend    | `npm run dev`  | Next.js dev server |
| Frontend    | `npm run build`| Production build   |
| Frontend    | `npm start`    | Run production     |
| Any service | `npm run dev`  | TypeScript watch + nodemon |
| Any service | `npm run build`| `tsc` compile      |
| Any service | `npm start`    | Run `dist/index.js`|

---

## License

ISC (or your chosen license).
