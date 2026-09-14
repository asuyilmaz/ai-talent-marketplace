# TALNIVO

**Your talent. Your next level.**

TALNIVO is an AI-powered talent marketplace designed to connect candidates and employers through skills, job matching, applications, and structured interview practice.

The platform provides separate workspaces for candidates and employers while using real application data, skill-based matching, secure authentication, and AI-assisted interview preparation.

---

## Features

### Candidate Workspace

Candidates can:

- Create and manage their professional profile
- Add and manage skills
- Browse published job opportunities
- View skill-based job match scores
- Review recommended matches
- Apply to jobs
- Track submitted applications
- Analyze skill gaps for job opportunities
- Manage CV information
- Practice interviews with AI
- Receive structured interview feedback and scoring
- Resume an active interview session after refreshing the page

### Employer Workspace

Employers can:

- Manage their company profile
- Create job postings
- Save jobs as drafts or publish them
- View job details
- Edit existing job postings
- Delete owned job postings
- Review applications
- Browse candidates
- Inspect candidate profiles and skills
- View applicant match information
- Manage employer settings

### AI Interview Practice

TALNIVO includes an AI-assisted interview practice system.

The interview workflow supports:

- Job-specific interview questions
- Multi-turn interview sessions
- Candidate answer evaluation
- Structured scoring and feedback
- Persistent interview sessions
- Session restoration after page refresh
- Interview reset and restart
- Database-backed rate limiting

AI requests are performed server-side so API credentials are never exposed to the browser.

---

## Skill Matching

TALNIVO uses a shared skill-matching system across the platform.

Candidate skills and job requirements are normalized before comparison, allowing match information to remain consistent across:

- Job listings
- Job detail pages
- Candidate matches
- Applications
- Employer applicant views

---

## Authentication & Authorization

Authentication is implemented using signed HTTP-only session cookies.

Protected API routes validate the authenticated session on the server and enforce candidate/employer permissions.

Examples include:

- Candidates can manage their own applications and interview sessions.
- Employers can manage jobs they own.
- Draft jobs remain accessible to their owner without being publicly exposed.
- Protected candidate and employer data requires an authenticated session.

Client-side user information is not treated as authorization.

---

## AI Rate Limiting

AI Interview Practice uses database-backed rate limiting.

Current limit:

- **10 AI requests per candidate**
- **10-minute window**

Starting an interview and submitting answers consume the limit.

Session restoration and reset operations do not consume AI requests.

---

## Tech Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend

- Next.js App Router
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- Prisma Postgres
- bcryptjs

### AI

- OpenAI Responses API
- Structured Outputs
- Server-side AI requests

### Deployment

- Vercel
- PostgreSQL / Prisma Postgres
- GitHub

---

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   ├── applications/
│   │   ├── auth/
│   │   ├── candidates/
│   │   ├── company/
│   │   └── jobs/
│   ├── candidate/
│   ├── employer/
│   ├── login/
│   └── register/
│
├── components/
│   ├── brand/
│   ├── layout/
│   └── ui/
│
├── lib/
│   ├── prisma.ts
│   ├── session.ts
│   └── skill-match.ts
│
└── types/

prisma/
├── migrations/
└── schema.prisma
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=
SESSION_SECRET=
OPENAI_API_KEY=
```

Never commit real credentials to Git.

The repository includes `.env.example` as a safe reference for the required environment variables.

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/asuyilmaz/ai-talent-marketplace.git
cd ai-talent-marketplace
npm install
```

Add the required environment variables to `.env`.

Generate the Prisma client:

```bash
npm run prisma:generate
```

Apply existing database migrations:

```bash
npm run db:migrate:deploy
```

Start the development server:

```bash
npm run dev
```

Use the local URL displayed in the terminal.

---

## Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server using Turbopack.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Production Server

```bash
npm run start
```

Runs the production build locally.

### Lint

```bash
npm run lint
```

Runs ESLint.

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Check Migration Status

```bash
npm run db:migrate:status
```

### Apply Production Migrations

```bash
npm run db:migrate:deploy
```

---

## Database Migrations

Database schema changes are tracked through Prisma migrations.

Before deploying schema changes, create and test the migration locally.

For production deployment, apply committed migrations with:

```bash
npm run db:migrate:deploy
```

Do not use development migration commands against the production database.

---

## Security

TALNIVO currently includes:

- HTTP-only authentication cookies
- Signed session tokens
- Server-side authorization
- Role-based candidate/employer access
- Job ownership validation
- Protected application access
- Server-side OpenAI integration
- Database-backed AI rate limiting
- Environment-based secrets
- Production-only secure cookies
- Database credential rotation support

Secrets such as database connection strings, session secrets, and OpenAI API keys must never be committed to the repository.

---

## Production

TALNIVO is deployed using Vercel.

Production requires the following environment variables:

```text
DATABASE_URL
SESSION_SECRET
OPENAI_API_KEY
```

After changing a production environment variable, a new Vercel deployment is required for the change to take effect.

---

## Status

TALNIVO currently includes functional candidate and employer workspaces, PostgreSQL persistence, role-based authentication and authorization, job/application workflows, skill matching, and AI Interview Practice.

The project is undergoing final production hardening and release preparation.

---

## License

This project is currently intended for educational and portfolio purposes.