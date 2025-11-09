# 🚀 ClaimPilot Quick Start Guide

## What's Been Done

I've successfully set up the foundation for your ClaimPilot enhancements:

### ✅ Completed
1. **Backend Database Integration**
   - Fixed Supabase connection issues
   - Updated ClaimPilot agent to use database instead of in-memory storage
   - Created database schema including `chat_messages` table

2. **Frontend Infrastructure**
   - Created Gemini API client (`frontend/lib/gemini.ts`)
   - Created Supabase client (`frontend/lib/supabase.ts`)
   - Built all agent logic modules (FinTrack, Repair Advisor, Compliance)
   - Set up environment variables

3. **Dependencies**
   - Installed Supabase Python client (backend)
   - Installed Supabase JS client (frontend)
   - All packages up to date

---

## 🎯 Next Steps

### Step 1: Update Database Schema

**Run this SQL in Supabase:**

1. Go to: https://arffctqxrifxotlwliwz.supabase.co/project/arffctqxrifxotlwliwz/sql/new
2. Open `backend/setup_database.sql`
3. Copy and paste the entire file
4. Click "Run" (this adds the `chat_messages` table)

---

### Step 2: Test Database Connection

```bash
cd backend
python3 test_db_connection.py
```

You should see:
```
✓ Successfully connected to database
DATABASE CONNECTION SUCCESSFUL!
```

---

### Step 3: Start the Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify at: http://localhost:8000/health

---

### Step 4: Start the Frontend

```bash
cd frontend
npm run dev
```

Access at: http://localhost:3000

---

## 📂 What to Build Next

I've created detailed documentation for the remaining tasks:

### 1. Read the Implementation Plan
Open `IMPLEMENTATION_PLAN.md` for:
- Detailed task breakdown
- Code examples
- File structure
- Testing checklist

### 2. Read the Summary
Open `CLAIMPILOT_ENHANCEMENTS_SUMMARY.md` for:
- Progress overview
- Priority rankings
- Effort estimates
- Common issues & solutions

---

## 🏗️ Building Blocks Ready

### Agent Logic (Ready to Use!)

```typescript
// FinTrack - Calculate payouts
import { calculatePayout } from '@/lib/agents/fintrack';
const result = calculatePayout({
  damage_description: "Rear bumper cracked, trunk dented",
  damage_severity: "moderate",
  deductible: 500,
  photos_uploaded: true
});
// Returns: { damage_total, payout, confidence, breakdown }

// Repair Advisor - Find shops
import { findRepairShops } from '@/lib/agents/repair-advisor';
const shops = findRepairShops({
  incident_type: "Car Accident",
  location: "Princeton, NJ",
  max_results: 3
});
// Returns: { shops: [...], total_found, search_location }

// Compliance - Validate claim
import { validateClaim } from '@/lib/agents/compliance';
const validation = validateClaim({
  policy_number: "ABC123",
  incident_date: "2025-01-15",
  // ... other fields
});
// Returns: { all_checks_passed, ready_to_submit, checks, missing_fields }
```

### Gemini API (Ready to Use!)

```typescript
// Chat with context
import { getGeminiClient } from '@/lib/gemini';

const gemini = getGeminiClient();
const result = await gemini.chat(
  "Can you estimate the damage?",
  conversationHistory,
  claimContext
);
// Returns: { response, action?, actionData? }

// Extract from document
const extracted = await gemini.extractClaimData(documentText);
// Returns: { incident_type, date, location, description, ... }
```

### Supabase (Ready to Use!)

```typescript
// Save chat message
import { saveChatMessage } from '@/lib/supabase';

await saveChatMessage({
  claim_id: "C-2025-12345",
  role: "user",
  content: "What's my estimated payout?"
});

// Load chat history
import { loadChatHistory } from '@/lib/supabase';

const messages = await loadChatHistory("C-2025-12345");
```

---

## 🎨 Priority Features to Build

### 1. Multi-Step Claim Form (4-6 hours)
**File:** `frontend/app/claims/new/page.tsx`

Replace the current upload modal with a 6-step form:
1. Incident Information
2. Vehicle Information
3. Insurance Information
4. Damage Information
5. Police Report
6. Document Upload

### 2. Real Gemini Chat (3-4 hours)
**File:** `frontend/app/claim/[id]/page.tsx`

Update the chat to:
- Call real Gemini API
- Persist messages to Supabase
- Load history on mount
- Detect agent triggers

### 3. Interactive Agent Cards (4-5 hours)
**Files:** `frontend/components/agents/AgentCard.tsx` + specific cards

Add "Orchestrator" tab with:
- Manual "Run Agent" buttons
- Status indicators
- Collapsible outputs
- Re-run capability

---

## 📝 Files You'll Need to Create

### Priority 1
- `frontend/app/claims/new/page.tsx` - Multi-step form
- `frontend/components/claim-form/StepIndicator.tsx` - Progress UI
- `frontend/components/claim-form/Step*.tsx` - Form steps (6 files)

### Priority 2
- `frontend/app/api/chat/route.ts` - Chat API route
- Modify: `frontend/app/claim/[id]/page.tsx` - Real Gemini integration

### Priority 3
- `frontend/components/agents/AgentCard.tsx` - Reusable card
- `frontend/components/agents/*Card.tsx` - Specific agents (5 files)
- `frontend/app/api/agents/*/route.ts` - API routes (4 files)

---

## 🐛 Troubleshooting

### Backend Database Connection Issues
If `test_db_connection.py` fails:
1. Check `.env` file has correct `SUPABASE_API_KEY` (service role key)
2. Verify tables exist in Supabase dashboard
3. Run `setup_database.sql` if tables are missing

### Frontend Gemini API Issues
If chat doesn't work:
1. Check `frontend/.env.local` has `NEXT_PUBLIC_GEMINI_API_KEY`
2. Test API key at: https://aistudio.google.com/apikey
3. Check browser console for errors

### CORS Issues
If frontend can't reach backend:
1. Ensure backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Verify FastAPI CORS middleware allows localhost:3000

---

## 💡 Development Tips

1. **Use React DevTools** - Inspect component state
2. **Use Network Tab** - Debug API calls
3. **Use Supabase Dashboard** - View database records
4. **Test Agents Independently** - Import and run in browser console
5. **Save Often** - Use localStorage for form drafts

---

## 📞 Get Help

- **Implementation Details:** See `IMPLEMENTATION_PLAN.md`
- **Progress & Priorities:** See `CLAIMPILOT_ENHANCEMENTS_SUMMARY.md`
- **Database Issues:** See `DATABASE_SETUP.md`
- **Code Examples:** Check comments in `frontend/lib/*.ts`

---

## 🎉 You're All Set!

Everything is configured and ready to go. The hard infrastructure work is done. Now it's time to build the UI!

**Start Here:**
1. Run database setup SQL
2. Test backend connection
3. Start both servers
4. Begin with multi-step form
5. Add Gemini chat integration
6. Build agent cards
7. Test end-to-end

Good luck building! 🚀
