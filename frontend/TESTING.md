# 🧪 Testing Guide - ClaimPilot

## ✅ Prerequisites

Before testing, ensure:
- ✅ Environment files exist (`frontend/.env.local` and `backend/.env`)
- ✅ API keys are configured (check `API_KEYS_LOCAL.txt`)
- ✅ Dependencies installed (`npm install` in frontend)
- ✅ Python packages installed (`pip install -r requirements.txt` in backend)

## 🎯 Quick Setup

### 1. Run Database Schema

**Go to your Supabase dashboard** → SQL Editor

1. Click **"New query"**
2. Open `/home/user/hackprinceton25/database-schema.sql`
3. Copy ALL content (190 lines)
4. Paste into Supabase SQL Editor
5. Click **RUN**

Expected: "Success. No rows returned"

### 2. Verify Tables Created

In Supabase Table Editor, you should see:
- ✅ `claims` table
- ✅ `chat_messages` table

### 3. Start Servers

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

## 🎨 Features to Test

### Feature 1: View Demo Claim
**URL**: http://localhost:3000/claim/C-DEMO-2025

**Expected**:
- See claim details in left sidebar
- Incident: Rear-end collision
- Vehicle: 2024 Hyundai Elantra
- Insurance: State Farm
- All agent outputs showing "Complete" ✅

### Feature 2: Multi-Step Form
**URL**: http://localhost:3000/claims/new

**Test**:
1. Fill out Step 1 (Incident Info)
2. Click "Continue"
3. Fill out Step 2 (Vehicle Info)
4. Continue through all 6 steps
5. Click "Submit Claim"
6. Should redirect to new claim page

### Feature 3: Chat Assistant
**On any claim page** → Click "Chat Assistant" tab

**Try these prompts**:
- "What's my estimated payout?"
- "When did the incident occur?"
- "What's the status of my claim?"
- "Run the FinTrack agent"

**Expected**:
- AI responds naturally ✅
- Knows claim details ✅
- Can trigger agents ✅

### Feature 4: Agent Orchestrator
**On any claim page** → Click "Agent Orchestrator" tab

**Test**:
1. Click "Run Agent" on **FinTrack** 💸
   - Should show payout calculation
   - Status changes to "Complete" ✅
   - Click "View Output" to see breakdown

2. Click "Run Agent" on **Repair Advisor** 🔧
   - Should show 3 repair shops
   - With ratings, pricing, distance
   - Can expand to see details

3. Click "Run Agent" on **Compliance** ✅
   - Shows validation results
   - "Ready to Submit" badge
   - Lists any missing fields

### Feature 5: Create New Claim
**Dashboard** → Click "Start New Claim"

**Fill out**:
- Incident: Today's date, your location, "parking lot" type
- Vehicle: 2023 Toyota Camry, ABC123
- Insurance: Geico, Policy-12345, Collision, $500 deductible
- Damage: "Front bumper dented", Moderate severity
- Police: No
- Documents: Skip (optional)

**Submit** → Should see new claim page ✅

## 📊 Status Indicators

Look for these visual confirmations:

**Agent States**:
- 🟡 **Idle** → Gray badge
- 🔵 **Running** → Yellow badge with spinner
- 🟢 **Complete** → Green badge with checkmark
- 🔴 **Error** → Red badge

**Form Validation**:
- ✅ Green checkmarks on completed steps
- ❌ Red borders on required fields
- Progress bar showing % complete

**Chat**:
- User messages: Blue gradient (right side)
- AI messages: Gray background (left side)
- Typing indicator: Animated dots

## 🐛 Common Issues

### Backend not connecting
```bash
# Check backend is running
curl http://localhost:8000/health

# Should see: {"status":"healthy"}
```

### Frontend not loading
```bash
# Check frontend is running
curl http://localhost:3000

# Should see HTML
```

### Chat not responding
1. Check `.env.local` has `GEMINI_API_KEY`
2. Check `backend/.env` has `GEMINI_API_KEY`
3. Restart backend server

### Demo claim not found
1. Go to Supabase SQL Editor
2. Run: `SELECT claim_id, status FROM claims;`
3. Should see C-DEMO-2025
4. If not, run `database-schema.sql` again

## 📸 Demo Screenshots

For presentations, capture:

1. **Dashboard** - List of claims
2. **New Claim Form** - Step 3 (insurance)
3. **Claim Detail** - Left sidebar with all info
4. **Chat Tab** - Conversation with AI
5. **Orchestrator Tab** - Agents with outputs
6. **FinTrack Output** - Payout breakdown
7. **Repair Advisor** - Shop recommendations

## ✨ Cool Features to Demo

1. **Natural Language Updates**:
   - Chat: "Change my deductible to $1000"
   - AI updates claim automatically ✅

2. **Agent Triggering via Chat**:
   - Chat: "Can you run the damage estimate?"
   - AI triggers FinTrack agent ✅

3. **Form Validation**:
   - Try to continue without filling required fields
   - See red error messages ✅

4. **Progress Tracking**:
   - Watch progress bar update through form steps
   - See agent status change in real-time ✅

---

**Need help?** Check `SETUP_GUIDE.md` for detailed troubleshooting.

**Ready to demo!** 🎉
