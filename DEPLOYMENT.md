# Deployment Guide

This guide explains how to deploy ClaimPilot to Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Render account (free tier)
- Gemini API key from Google AI Studio
- (Optional) Supabase account for database

---

## Backend Deployment (Render)

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables**
   - In Render dashboard, go to your service
   - Click "Environment" tab
   - Add these variables:
     - `GEMINI_API_KEY`: Your Google Gemini API key
     - `SUPABASE_URL`: (Optional) Your Supabase URL
     - `SUPABASE_KEY`: (Optional) Your Supabase anon key

4. **Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment (usually 2-3 minutes)
   - Your backend will be live at: `https://your-service-name.onrender.com`

### Option 2: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `claimpilot-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as above)
6. Click "Create Web Service"

### Verify Backend Deployment

Visit: `https://your-backend-url.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T...",
  "agents": {
    "claimpilot": "active",
    "fintrack": "active",
    "shopfinder": "active",
    "claim_drafting": "active",
    "compliance": "active"
  }
}
```

---

## Frontend Deployment (Vercel)

### Step 1: Update vercel.json

In `frontend/vercel.json`, replace:
```json
"destination": "https://your-backend-url.onrender.com/api/:path*"
```

With your actual Render backend URL:
```json
"destination": "https://claimpilot-backend.onrender.com/api/:path*"
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional, can also use dashboard)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Dashboard** (Easiest)
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `.next` (auto-detected)
   - Click "Deploy"

3. **Set Environment Variables**
   - In Vercel project settings → "Environment Variables"
   - Add these variables (for all environments: Production, Preview, Development):
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `GEMINI_API_KEY`: Your Gemini API key
     - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://claimpilot-backend.onrender.com`)

4. **Redeploy** (if you added env vars after initial deploy)
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

### Step 3: Deploy via CLI (Alternative)

```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? (Select your account)
- Link to existing project? `N`
- What's your project's name? `claimpilot-frontend`
- In which directory is your code located? `./`
- Want to override settings? `N`

After first deployment, set environment variables:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter your backend URL when prompted
# Select Production, Preview, Development

vercel env add GEMINI_API_KEY
# Enter your API key when prompted

# Repeat for other variables
```

Then redeploy:
```bash
vercel --prod
```

### Verify Frontend Deployment

1. Visit your Vercel URL (e.g., `https://claimpilot-frontend.vercel.app`)
2. Try creating a claim
3. Check that agents are working
4. Test the emergency chatbot

---

## Environment Variables Reference

### Backend (.env)
```bash
GEMINI_API_KEY=your-gemini-api-key-here
SUPABASE_URL=your-supabase-url        # Optional
SUPABASE_KEY=your-supabase-key        # Optional
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

---

## Getting API Keys

### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### Supabase (Optional)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Anon/Public key → `SUPABASE_ANON_KEY` / `SUPABASE_KEY`

---

## Troubleshooting

### Backend Issues

**Problem**: "Module not found" errors
- **Solution**: Check `requirements.txt` has all dependencies
- Redeploy on Render

**Problem**: "GEMINI_API_KEY not set" warning
- **Solution**: Add environment variable in Render dashboard
- Redeploy

**Problem**: 500 errors on API calls
- **Solution**: Check Render logs: Dashboard → Service → Logs
- Look for Python errors

### Frontend Issues

**Problem**: "API call failed" or CORS errors
- **Solution**:
  1. Verify `NEXT_PUBLIC_API_URL` is set correctly
  2. Update `vercel.json` with correct backend URL
  3. Check backend CORS settings in `main.py`

**Problem**: Environment variables not working
- **Solution**:
  1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
  2. Redeploy after adding env vars
  3. Clear Vercel build cache: Settings → Clear Cache

**Problem**: Build fails
- **Solution**: Check Vercel build logs
- Verify `package.json` scripts are correct
- Try building locally: `npm run build`

### Free Tier Limitations

**Render Free Tier**:
- App spins down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- 750 hours/month (enough for demo)

**Workaround**: Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 10 minutes to keep it awake during demo time.

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Serverless function timeout: 10 seconds
- No cold starts (always fast!)

---

## Post-Deployment Checklist

- [ ] Backend health check works: `/health`
- [ ] Frontend loads correctly
- [ ] Emergency chatbot works
- [ ] Claim form submission works
- [ ] AI agents process claims (Core, FinTrack, Drafting)
- [ ] AI assistant chat responds
- [ ] Demo buttons work
- [ ] No console errors (check browser DevTools)

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Auto-deploy**:
   - Vercel automatically deploys on push
   - Render automatically deploys on push
   - Check deployment status in respective dashboards

---

## Production Checklist

Before going live:

- [ ] Update CORS origins in `backend/main.py` to specific domains
- [ ] Set up proper domain names (optional)
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set up monitoring/logging
- [ ] Test all features in production environment
- [ ] Create backup of Supabase database (if using)

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

Good luck with your deployment! 🚀
