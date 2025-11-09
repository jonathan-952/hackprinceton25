# Database Setup Guide

## ✅ What's Been Fixed

I've successfully integrated Supabase database into your ClaimPilot system:

1. ✅ Added Supabase Python client to `requirements.txt`
2. ✅ Created database configuration module (`backend/config/database.py`)
3. ✅ Updated ClaimPilot agent to use Supabase instead of in-memory storage
4. ✅ Fixed `.env` file API key format issues
5. ✅ Installed all required Python dependencies
6. ✅ Created SQL schema file for database tables

## 🔧 What You Need to Do

### Step 1: Create Database Tables in Supabase

The database connection is working, but the tables don't exist yet. Follow these steps:

1. **Open Supabase SQL Editor:**
   - Go to: https://arffctqxrifxotlwliwz.supabase.co/project/arffctqxrifxotlwliwz/sql/new
   - Or navigate: Supabase Dashboard → SQL Editor (left sidebar)

2. **Run the Setup SQL:**
   - Open the file: `backend/setup_database.sql`
   - Copy ALL the contents
   - Paste into the Supabase SQL editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success. No rows returned" message

3. **Verify Tables Created:**
   - Go to: Table Editor in Supabase
   - You should see 3 new tables:
     - `claims`
     - `financial_estimates`
     - `repair_shops`

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

### Step 3: Start the Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Test the API

Open your browser to:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## 📊 Database Schema

### Claims Table
- Stores all insurance claims
- Indexed by `claim_id` and `status`
- Automatically tracks `created_at` and `updated_at`

### Financial Estimates Table
- Links to claims via `claim_id`
- Stores damage estimates and payout calculations

### Repair Shops Table
- Links to claims via `claim_id`
- Stores recommended repair shop information

## 🔐 Environment Variables

Your `.env` file has been updated with correct format:

```
GEMINI_API_KEY=AIzaSyBNIPuJGTOVNqF-VeJfWjAC3JErSYoFlqg
NEXT_PUBLIC_SUPABASE_URL=https://arffctqxrifxotlwliwz.supabase.co
SUPABASE_API_KEY=<your-service-role-key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## 🔄 How It Works Now

**Before:** Claims were stored in memory (lost on restart)
```python
self.claims_database = {}  # In-memory dictionary
```

**After:** Claims are persisted in Supabase
```python
self.db = supabase_client  # Real database connection
```

All claim operations now use the database:
- ✅ `process_document()` → Saves to DB
- ✅ `get_claim()` → Reads from DB
- ✅ `list_claims()` → Queries DB
- ✅ `update_claim_status()` → Updates DB

## 🧪 Testing the Integration

### Test 1: Create a Claim
```bash
curl -X POST http://localhost:8000/api/process-claim \
  -F "text=Car accident on Main St, estimated damage $5000"
```

### Test 2: List Claims
```bash
curl http://localhost:8000/api/claims
```

### Test 3: Get Specific Claim
```bash
curl http://localhost:8000/api/claims/<claim-id>
```

## ❗ Troubleshooting

### Error: "Could not find the table 'public.claims'"
**Solution:** Run the SQL in `backend/setup_database.sql` in Supabase SQL Editor

### Error: "JWT" or "API key" issues
**Solution:** Check that `SUPABASE_API_KEY` in `.env` is the **service_role** key, not the anon key

### Error: Connection timeout
**Solution:**
1. Check your internet connection
2. Verify Supabase project is active
3. Check if you're behind a firewall/VPN

## 📝 Files Modified/Created

### Modified:
- `backend/requirements.txt` - Added supabase, python-dotenv
- `backend/agents/claimpilot_agent.py` - Database integration
- `.env` - Fixed API key format

### Created:
- `backend/config/database.py` - Database configuration
- `backend/config/__init__.py` - Config module init
- `backend/setup_database.sql` - Database schema
- `backend/test_db_connection.py` - Connection test script
- `DATABASE_SETUP.md` - This guide

## 🎯 Next Steps

1. Run the SQL in Supabase (Step 1 above)
2. Test the connection
3. Start the backend server
4. Start using your ClaimPilot system with persistent storage!

All claims will now be saved permanently in your Supabase database! 🎉
