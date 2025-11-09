# ClaimPilot Setup Guide 🚀

## ✅ What's Already Done

- ✅ Environment variables configured locally (`.env.local` and `backend/.env`)
- ✅ Supabase client installed
- ✅ Gemini API key set
- ✅ All code and components ready

## 🔑 API Keys

Your API keys are stored locally in:
- `API_KEYS_LOCAL.txt` - Reference copy (gitignored, safe)
- `frontend/.env.local` - Frontend environment variables (gitignored)
- `backend/.env` - Backend environment variables (gitignored)

**These files are NOT committed to git for security!**

## 📋 Setup Steps

### Step 1: Verify Environment Files Exist

Check that these files exist locally:
```bash
ls frontend/.env.local
ls backend/.env
ls API_KEYS_LOCAL.txt
```

If they don't exist, create them using the templates in `.env.example` files.

### Step 2: Create Database Tables in Supabase

1. **Go to your Supabase project dashboard**

2. **Open the SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the entire contents** of `database-schema.sql`

4. **Run the query** (Click "RUN" or press Cmd/Ctrl + Enter)

This will create:
- ✅ `claims` table
- ✅ `chat_messages` table
- ✅ Demo claim (C-DEMO-2025)
- ✅ Indexes for performance
- ✅ RLS policies

### Step 3: Verify the Setup

After running the SQL, you should see:
- 2 new tables in the "Table Editor"
- 1 demo claim in the `claims` table

### Step 4: Start the Applications

**Terminal 1 - Backend:**
```bash
cd /home/user/hackprinceton25/backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd /home/user/hackprinceton25/frontend
npm run dev
```

### Step 5: Test the Application

1. **Open**: http://localhost:3000/dashboard

2. **View Demo Claim**:
   - Go to http://localhost:3000/claim/C-DEMO-2025
   - You should see the pre-populated demo claim

3. **Create New Claim**:
   - Click "Start New Claim"
   - Fill out the 6-step form
   - Submit

4. **Test Chat**:
   - On any claim page, go to "Chat Assistant" tab
   - Try: "What's my estimated payout?"
   - Try: "Run the FinTrack agent"

5. **Test Orchestrator**:
   - Go to "Agent Orchestrator" tab
   - Click "Run Agent" on any agent
   - View the output

## 🧪 Testing Checklist

- [ ] Database tables created in Supabase
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can view demo claim (C-DEMO-2025)
- [ ] Can create new claim via 6-step form
- [ ] Chat works and responds
- [ ] Agents can be triggered manually
- [ ] Agent outputs display correctly

## 🐛 Troubleshooting

### "Access denied" or "relation does not exist"
→ You haven't run the database schema yet. Go to Supabase SQL Editor and run `database-schema.sql`

### "fetch failed" errors
→ Make sure backend is running on port 8000

### Chat doesn't respond
→ Check that GEMINI_API_KEY is set in both `.env.local` and `backend/.env`

### "Claim not found"
→ Make sure you ran the database schema to create the demo claim

## 🔒 Security Best Practices

1. **Never commit .env files** - They're in .gitignore
2. **Never share API keys publicly** - Keep them local only
3. **Rotate keys if exposed** - Get new keys from Gemini/Supabase
4. **Use .env.example for templates** - Share these, not actual keys

## 📁 Key Files

- `database-schema.sql` - Run this in Supabase SQL Editor
- `frontend/.env.local` - Frontend environment variables (gitignored)
- `backend/.env` - Backend environment variables (gitignored)
- `API_KEYS_LOCAL.txt` - API keys reference (gitignored)

## 🎯 Quick Start Commands

```bash
# Terminal 1 - Backend
cd /home/user/hackprinceton25/backend
python main.py

# Terminal 2 - Frontend
cd /home/user/hackprinceton25/frontend
npm run dev

# Then open: http://localhost:3000/dashboard
```

---

## 🎉 Once Setup is Complete

You'll have:
- 🎨 Beautiful multi-step claim creation form
- 💬 AI-powered chat with Gemini
- 🤖 5 specialized orchestrator agents
- 📊 Interactive agent cards with live outputs
- 🎯 Demo claim showing all features

**Happy testing!** 🚀
