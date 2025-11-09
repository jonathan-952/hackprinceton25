# 🚀 Quick Start - ClaimPilot

## ⚡ 4-Step Setup

### 1️⃣ Create Environment Files (1 minute)

Your API keys are stored locally in `API_KEYS_LOCAL.txt` (not committed to git).

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
GEMINI_API_KEY=<your-gemini-api-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** - Create `backend/.env`:
```env
GEMINI_API_KEY=<your-gemini-api-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

> **🔑 Your actual API keys**: Check `API_KEYS_LOCAL.txt` in the project root (this file is gitignored and safe).
>
> **Already set up?** The .env files are already configured locally - you don't need to recreate them!

### 2️⃣ Set Up Database (2 minutes)

1. Go to your Supabase dashboard
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. **Copy entire contents** of `database-schema.sql`
5. **Paste** into SQL Editor
6. Click **"RUN"** ✅

### 3️⃣ Start Backend

```bash
cd /home/user/hackprinceton25/backend
python main.py
```

Wait for: `Uvicorn running on http://0.0.0.0:8000`

### 4️⃣ Start Frontend

```bash
cd /home/user/hackprinceton25/frontend
npm run dev
```

Wait for: `Local: http://localhost:3000`

---

## 🎯 Open & Test

**Dashboard**: http://localhost:3000/dashboard

**Demo Claim**: http://localhost:3000/claim/C-DEMO-2025

**Try**:
- Click "Start New Claim" → Fill 6-step form
- View demo claim → Chat tab → "What's my payout?"
- Orchestrator tab → Click "Run Agent" buttons

---

## ✅ That's it!

All .env files are already configured locally. Just run the database schema and start both servers.

## 🔒 Security Note

- API keys are stored in `.env` files (gitignored)
- Reference copy in `API_KEYS_LOCAL.txt` (also gitignored)
- **NEVER commit these files to git!**
