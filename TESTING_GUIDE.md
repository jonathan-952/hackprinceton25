# 🚀 ClaimPilot Testing Guide

## Current Flow (Already Configured)

### ✅ Multi-Step Claim Creation Flow

When you click **"Create Your First Claim"**, here's what happens:

1. **Routes to `/claims/new`** - Opens the multi-step form
2. **6-Step Wizard** - Asks questions about your accident:
   - **Step 1**: Incident Information (date, time, location, type, description)
   - **Step 2**: Vehicle Information (year, make, model, license plate, VIN)
   - **Step 3**: Insurance Information (provider, policy number, coverage type, deductible)
   - **Step 4**: Damage Information (description, severity, photos)
   - **Step 5**: Police Report (optional - report number, officer name)
   - **Step 6**: Document Upload (photos, PDFs, etc.) ← **Documents are at the end**
3. **Submit** - Creates the claim and redirects to claim detail page
4. **Chat with Gemini** - Available on the claim detail page

### ✅ Gemini Chatbot Integration

The Gemini chatbot is available on **every claim detail page** under the "Chat" tab.

---

## 🧪 How to Test

### Step 1: Run Database Schema

**⚠️ REQUIRED - Do this first!**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `arffctqxrifxotlwliwz`
3. Click **SQL Editor** → **New Query**
4. Copy contents from `/home/user/hackprinceton25/database-schema.sql`
5. Paste and click **Run**

### Step 2: Start Backend Server

```bash
cd /home/user/hackprinceton25/backend
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
Warning: GEMINI_API_KEY not set. Chat functionality will be limited.  # ← Ignore this if you see it
```

**✅ Backend Ready:** http://localhost:8000

### Step 3: Start Frontend Server

**Open a NEW terminal** (keep backend running):

```bash
cd /home/user/hackprinceton25/frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

**✅ Frontend Ready:** http://localhost:3000

---

## 🎯 Testing the Multi-Step Form

1. **Go to Dashboard:** http://localhost:3000
2. **Click:** "Create Your First Claim" button
3. **Fill out Step 1** (Incident Information):
   - Date: Today's date
   - Time: 2:30 PM
   - Location: "Route 1 & Nassau St, Princeton, NJ"
   - Type: Select "Rear-end collision"
   - Description: Write at least 20 characters about the accident
4. **Click "Continue"** → Goes to Step 2
5. **Fill out Step 2** (Vehicle Information):
   - Year: 2024
   - Make: Honda
   - Model: Civic
   - License Plate: ABC1234
   - VIN (optional): 1HGBH41JXMN109186
6. **Click "Continue"** → Goes to Step 3
7. **Fill out Step 3** (Insurance Information):
   - Provider: State Farm
   - Policy Number: SF-123456789
   - Coverage Type: Comprehensive
   - Deductible: 500
8. **Click "Continue"** → Goes to Step 4
9. **Fill out Step 4** (Damage Information):
   - Description: Describe the damage (20+ characters)
   - Severity: Moderate
   - Photos Uploaded: Check the box
10. **Click "Continue"** → Goes to Step 5
11. **Fill out Step 5** (Police Report):
    - Police Called: Yes
    - Report Number: PR-2025-12345
    - Officer Name: Officer Smith
12. **Click "Continue"** → Goes to Step 6
13. **Step 6** (Document Upload):
    - Click "Choose Files" or drag & drop photos/PDFs
    - Upload accident photos, police report, etc.
14. **Click "Submit Claim"**
15. **Success!** → Redirects to claim detail page

---

## 💬 Testing the Gemini Chatbot

### After Creating a Claim:

1. **You'll be on the claim detail page:** `/claim/C-2025-XXXXX`
2. **Click the "Chat" tab** (next to "Orchestrator")
3. **You'll see a welcome message** from ClaimPilot AI
4. **Type a message** to test the chatbot:

### Test Messages to Try:

```
"What's my estimated payout?"
→ Gemini will analyze your claim and provide payout estimate

"Which repair shop is closest to me?"
→ Shows repair shop recommendations

"Update my phone number to 555-1234"
→ Gemini will update the claim (if agent triggers are enabled)

"Tell me about my claim status"
→ Provides claim summary and next steps

"What documents do I still need to upload?"
→ Lists missing documents

"Explain my insurance coverage"
→ Explains your policy details
```

### What You Should See:

✅ **Message appears** in the chat history
✅ **Loading indicator** shows while Gemini is thinking
✅ **AI response** appears with helpful information
✅ **Responses are contextual** - Gemini knows your claim details

---

## 🐛 Troubleshooting

### Problem: "Create Your First Claim" Shows Upload Modal

**This shouldn't happen** - the code already routes to the multi-step form.

**If you see this:**
1. Hard refresh the page: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check the URL - should be `http://localhost:3000/claims/new`

### Problem: Gemini Chat Not Working

**Symptom:** Chat doesn't respond or shows errors

**Solutions:**

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Check Gemini API Key:**
   ```bash
   grep "GEMINI_API_KEY" backend/.env
   ```
   Should show: `GEMINI_API_KEY=AIzaSyBNIPuJGTOVNqF...`

3. **Test Backend Chat Endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "claim_id": "C-DEMO-2025",
       "message": "Hello",
       "context": {}
     }'
   ```
   Should return JSON with a response.

4. **Check Browser Console:**
   - Press `F12` to open DevTools
   - Click "Console" tab
   - Look for errors (red text)
   - Common issues:
     - `Failed to fetch` → Backend not running
     - `CORS error` → Check backend CORS settings
     - `500 error` → Check backend logs

5. **Check Backend Logs:**
   Look at the terminal where you ran `python main.py`
   - Errors will show here
   - Common issues:
     - `GEMINI_API_KEY not set` → Check `.env` file
     - `google.generativeai` import error → Run `pip install google-generativeai`

### Problem: Database Errors

**Symptom:** Claims don't save or load

**Solution:**
1. Make sure you ran the database schema in Supabase
2. Check Supabase connection:
   ```bash
   grep "SUPABASE" frontend/.env.local
   ```
3. Verify tables exist in Supabase:
   - Go to Supabase → Table Editor
   - Should see `claims` and `chat_messages` tables

### Problem: Form Validation Errors

**Symptom:** Can't proceed to next step

**Solution:**
- Make sure all required fields are filled
- Description fields need at least 20 characters
- Check for red error messages under fields

### Problem: Demo Claim Not Found

**Symptom:** `http://localhost:3000/claim/C-DEMO-2025` shows "Not found"

**Solution:**
1. Run the database schema - it includes the demo claim
2. Check if backend is running and connected to Supabase

---

## 🎯 Expected Behavior Summary

### ✅ Dashboard (http://localhost:3000)
- Shows "Create Your First Claim" button
- Lists existing claims (if any)
- Shows demo claim `C-DEMO-2025` (after running schema)

### ✅ New Claim Flow (http://localhost:3000/claims/new)
- Shows 6-step wizard
- Progress bar at top
- "Back" and "Continue" buttons
- Validation on each step
- Document upload at Step 6
- Submits and redirects to claim detail

### ✅ Claim Detail Page (http://localhost:3000/claim/C-DEMO-2025)
- Left sidebar: Claim info summary
- Right side: Tabs (Chat | Orchestrator)
- **Chat Tab:**
  - Welcome message from AI
  - Input box at bottom
  - Messages scroll automatically
  - Gemini responds with context-aware answers
- **Orchestrator Tab:**
  - 5 agent cards
  - Manual "Run Agent" buttons
  - Shows agent outputs when complete

---

## 🔑 API Keys (Already Configured)

Your API keys are stored in:
- ✅ `/home/user/hackprinceton25/backend/.env`
- ✅ `/home/user/hackprinceton25/frontend/.env.local`
- ✅ **Gitignored** - Safe from commits

**To view your keys:** Check the `.env` files listed above (they are gitignored)

---

## 📊 Quick Checklist

Before testing, make sure:

- [ ] Database schema run in Supabase
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] `.env` files exist with API keys
- [ ] Browser DevTools console shows no errors

---

## 🎉 Success Criteria

You've successfully set up ClaimPilot when:

1. ✅ Multi-step form works (all 6 steps)
2. ✅ Documents upload at Step 6
3. ✅ Claim saves to Supabase
4. ✅ Gemini chatbot responds to messages
5. ✅ Chat is contextually aware of claim details
6. ✅ Orchestrator panel shows 5 agents
7. ✅ Demo claim loads with pre-populated data

---

**Need Help?** Check the troubleshooting section above or review:
- `/home/user/hackprinceton25/QUICK_START.md`
- `/home/user/hackprinceton25/SETUP_GUIDE.md`
