# ReelOS — AI Content Operating System

> One operator. 10 channels. 20 reels/day. AI handles the cognitive work. The operator handles the judgment work.


DEMO: https://drive.google.com/file/d/159C2QAe5DQGqgCQsBQi7Va4YfcpdIWCM/view?usp=drive_link
---

## What This Is

ReelOS is an AI-first content operating system built for managing short-form content at scale. It solves the core bottleneck in faceless content production — the scripting, captioning, and creative decision-making that burns operators out at 2-3 channels and prevents scaling further.

**The system produces a complete Instagram Reel content brief in ~30 seconds:**
- 5 hook variations (question, stat, story, controversy, listicle)
- Full teleprompter-ready script (120-150 words, ~55s spoken)
- Instagram caption + 15 hashtags + CTA
- 6 timestamped B-roll suggestions
- ElevenLabs-ready voiceover script
- Virality score (0-100) with per-dimension breakdown

---

## The Problem It Solves

| Manual workflow | ReelOS workflow |
|----------------|-----------------|
| 30-45 min per script | ~30 seconds per brief |
| 1 operator = max 2-3 channels | 1 operator = 10+ channels |
| No feedback loop | Content intelligence layer built in |
| Generic AI output | Channel DNA injected into every prompt |
| Scripts in Docs, captions in Notes | Everything in one searchable database |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ReelOS System                        │
│                                                         │
│  Operator Input                                         │
│  (topic + channel)                                      │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │           AI Content Pipeline (GPT-4o)           │   │
│  │                                                  │   │
│  │  1. Load channel DNA (niche, tone, audience)     │   │
│  │  2. Generate 5 hook variations                   │   │
│  │  3. Select best hook → write script              │   │
│  │  4. Build social package (caption + hashtags)    │   │
│  │  5. Generate B-roll suggestions                  │   │
│  │  6. Format voiceover script                      │   │
│  │  7. Score virality (5 dimensions)                │   │
│  │  8. Save to content library                      │   │
│  └─────────────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  Content Library (Supabase)                             │
│         │                                               │
│         ▼                                               │
│  Feedback Loop Engine                                   │
│  (learns what works → updates next generation)         │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.12) |
| AI | OpenAI GPT-4o — JSON mode, structured outputs |
| Database | Supabase (PostgreSQL) |
| Frontend | React + Vite + Tailwind CSS |
| State management | Zustand |
| Charts | Recharts |
| HTTP client | Axios |
| Retry logic | Tenacity (3 attempts, exponential backoff) |

---

## Project Structure

```
reelos/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, routers
│   ├── config.py                  # Pydantic settings, env vars
│   ├── seed.py                    # Seeds 10 demo channels
│   ├── supabase_schema.sql        # Full database schema
│   ├── requirements.txt
│   │
│   ├── routes/
│   │   ├── channels.py            # CRUD + stats endpoints
│   │   ├── generate.py            # Main generation pipeline
│   │   └── content.py             # Content library endpoints
│   │
│   ├── services/
│   │   ├── openai_service.py      # All 6 GPT-4o calls
│   │   ├── content_pipeline.py    # Pipeline orchestrator
│   │   ├── virality_scorer.py     # Rule-based pre-filter
│   │   └── supabase_client.py     # DB singleton
│   │
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   │
│   └── prompts/
│       ├── templates.py           # 6 reusable prompt templates
│       └── niche_overrides.py     # Per-niche + per-tone injections
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx      # Command center overview
    │   │   ├── Channels.jsx       # Channel management
    │   │   ├── Generate.jsx       # AI pipeline + output UI
    │   │   ├── Library.jsx        # Content database
    │   │   └── Analytics.jsx      # Performance + feedback loop
    │   │
    │   ├── components/
    │   │   ├── layout/            # Sidebar, Layout wrapper
    │   │   └── shared/            # NicheBadge, StatusPill, ScoreRing
    │   │
    │   ├── api/client.js          # Axios API layer
    │   └── store/useAppStore.js   # Zustand global state
    └── ...config files
```

---

## Database Schema

```
channels             → channel config, niche, tone, audience, style notes
content_briefs       → all generated content with full output
hook_variations      → all 5 hooks per generation
performance_metrics  → views, likes, saves, watch time
feedback_patterns    → pre-aggregated intelligence layer
```

---

## API Endpoints

```
GET    /health                          System health check
GET    /api/channels                    List all channels
POST   /api/channels                    Create channel
GET    /api/channels/{id}               Get channel
PATCH  /api/channels/{id}               Update channel
GET    /api/channels/{id}/stats         Channel performance stats

POST   /api/generate                    Run full AI pipeline
GET    /api/generate/status             Generation service status

GET    /api/content                     List content (filterable)
GET    /api/content/{id}                Get content brief
PATCH  /api/content/{id}/status         Update status
GET    /api/content/channel/{id}/summary Channel content summary
```

---

## Local Setup

### Prerequisites
- Python 3.12 (not 3.14 — pydantic-core requires ≤ 3.13)
- Node.js 18+
- Supabase account (free tier works)
- OpenAI API key

### 1. Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**
3. Paste and run the contents of `backend/supabase_schema.sql`
4. Click **Run without RLS**

### 2. Backend

```bash
cd backend

# Create venv with Python 3.12 specifically
python3.12 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — add your OpenAI key and Supabase credentials
```

Your `.env` should look like:
```
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
ENVIRONMENT=development
```

```bash
# Seed 10 demo channels
python seed.py

# Start the server
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Open: `http://localhost:5173`

---

## How to Use

1. **Dashboard** — See all 10 channels and recent content at a glance
2. **Channels** — Create or configure channels with niche, tone, and audience
3. **Generate** — Select a channel, enter a topic, hit Generate
4. Watch the 8-step AI pipeline animate in real time (~30 seconds)
5. Review: 5 hook options → script → caption → B-roll → voiceover → score
6. Approve content → it moves to the library
7. **Library** — Browse, filter, and manage all generated content
8. **Analytics** — See what's working, track virality scores, view the feedback loop

---

## The Feedback Loop

Every approved and posted piece of content feeds back into the system:

```
Content generated → approved → posted → metrics recorded
                                              ↓
                              System analyzes: which hook types,
                              script lengths, topic clusters
                              performed above median
                                              ↓
                              Patterns stored in feedback_patterns table
                                              ↓
                              Next generation batch for that channel
                              auto-prioritizes winning patterns
```

This is what separates a content generation tool from a content operating system.

---

## Scaling Model

| Channels | Reels/day | Pipeline time | Operator review time |
|----------|-----------|---------------|---------------------|
| 1 | 2 | ~1 min | ~5 min |
| 5 | 10 | ~5 min | ~15 min |
| 10 | 20 | ~10 min | ~30 min |
| 20 | 40 | ~20 min | ~60 min |

Adding channels does not require adding operators. It requires creating a new channel profile.

---

## Deployment

**Backend → Railway**
```bash
# Add to backend/
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Push to GitHub → connect Railway → add env vars
```

**Frontend → Vercel**
```bash
# Push frontend/ to GitHub → import to Vercel
# Set env var: VITE_API_URL=https://your-railway-backend.up.railway.app
```

---

## Built For

Matiks Hiring Assignment — demonstrating AI-first systems thinking, scalable content automation, and operator-focused product design.

**The core principle:** Automate everything except the decision.
