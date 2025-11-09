# ClaimPilot - Quick Deployment

## 🚀 Deploy in 10 Minutes

### 1️⃣ Backend (Render) - 5 minutes

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click "New" → "Blueprint"
3. Connect this GitHub repo
4. Render auto-detects `render.yaml`
5. Add environment variables:
   - `GEMINI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
6. Click "Apply" → Wait 2-3 minutes
7. Copy your backend URL: `https://your-app.onrender.com`

### 2️⃣ Frontend (Vercel) - 5 minutes

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click "Add New Project" → Import this repo
3. Set **Root Directory**: `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
   - `GEMINI_API_KEY`: Same as backend
5. Click "Deploy" → Wait 2 minutes
6. Done! Visit your app at `https://your-app.vercel.app`

### 3️⃣ Update Backend URL

In `frontend/vercel.json`, line 8:
```json
"destination": "https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/:path*"
```

Then redeploy on Vercel.

---

## 🔑 Get API Keys

**Gemini API** (Required):
- Visit: https://aistudio.google.com/app/apikey
- Click "Create API Key"
- Copy and paste into both Vercel and Render

**Supabase** (Optional - for database):
- Visit: https://supabase.com/dashboard
- Create project → Settings → API
- Copy URL and anon key

---

## ✅ Test Your Deployment

1. Visit your Vercel URL
2. Click "Start New Claim"
3. Click "Fill Demo Data" button
4. Submit claim
5. Click demo buttons for agents
6. Try emergency chatbot

---

## 📖 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

---

## 🐛 Common Issues

**Backend takes 30+ seconds to respond first time?**
- Render free tier spins down after 15 min. This is normal.
- Use [UptimeRobot](https://uptimerobot.com/) to keep it awake during demos.

**CORS errors?**
- Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Update `frontend/vercel.json` with correct backend URL

**Agents not working?**
- Verify `GEMINI_API_KEY` is set in both Vercel and Render
- Check Render logs for errors

---

## 🎯 Environment Variables Checklist

### Render (Backend)
- [x] `GEMINI_API_KEY`
- [ ] `SUPABASE_URL` (optional)
- [ ] `SUPABASE_KEY` (optional)

### Vercel (Frontend)
- [x] `NEXT_PUBLIC_API_URL`
- [x] `GEMINI_API_KEY`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (optional)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)

---

Good luck! 🎉
