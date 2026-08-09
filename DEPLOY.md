# CatCal release checklist

Follow these steps **in order**. The APK will not work until the backend is live on the internet.

## 1. Database (Supabase)

1. Open your [Supabase](https://supabase.com) project.
2. In **SQL Editor**, run `backend/sql/supabase_complete.sql` if you have not already.
3. Confirm tables exist: User, Profile, Cat, FeedingLog, etc.

## 2. Deploy the backend (Render — free tier)

1. Push this project to **GitHub** (required for Render).
2. Go to [render.com](https://render.com) → **New** → **Blueprint**.
3. Connect the repo and use `backend/render.yaml` (or create a **Web Service** manually):
   - **Root directory:** `backend`
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Health check path:** `/health`
4. In Render **Environment**, set these variables (copy values from your local `backend/.env`):

   | Variable | Value |
   |----------|--------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Your Supabase pooler URL (`sslmode=require`) |
   | `DIRECT_URL` | Your Supabase direct URL |
   | `JWT_SECRET` | Long random string (`openssl rand -base64 32`) |
   | `CORS_ORIGIN` | `*` |
   | `RESEND_API_KEY` | (optional) for password-reset emails |

5. Deploy and wait until status is **Live**.
6. Open `https://catcal-api.onrender.com/health` — you should see `{"ok":true,"service":"catcal-api"}`.
7. Open `https://catcal-api.onrender.com/health/db` — should show `"database":"connected"`.

   If your Render URL is **not** `catcal-api.onrender.com`, update `EXPO_PUBLIC_API_URL` in `eas.json` and rebuild the APK.

> **Note:** Render free tier sleeps after inactivity. The first request may take 30–60 seconds. CatCal already uses longer timeouts for login.

## 3. Build the APK (EAS)

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Link project (first time only): `eas build:configure`
4. Build installable APK:
   ```bash
   eas build --profile preview --platform android
   ```
5. Download the APK from the link EAS gives you and install on your phone.

## 4. Test on a real phone

1. Install the APK (allow installs from unknown sources if needed).
2. Register a new account or log in.
3. Add a cat, mark a feeding, scan QR.

If login fails:

- Confirm `https://catcal-api.onrender.com/health/db` works in the phone browser.
- Rebuild the APK after any `eas.json` URL change.

## Local development (unchanged)

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — app
# Set EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:3001 in .env
npm start
```

## Files reference

| File | Purpose |
|------|---------|
| `backend/render.yaml` | One-click Render deploy config |
| `backend/Dockerfile` | Optional Docker deploy |
| `backend/.env.example` | Backend env template |
| `eas.json` | APK build profile + production API URL |
| `app.config.ts` | Validates HTTPS API URL on release builds |
