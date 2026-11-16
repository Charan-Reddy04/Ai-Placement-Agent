# CampusPilot 🎓 Deployment Guide

CampusPilot is production-ready and configured to support multiple flexible deployment architectures:

---

## 📋 Required Environment Variables

Regardless of which deployment platform you choose, configure these environment variables on your production host:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend listening port | `5000` (or assigned by platform) |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://<user>:<password>@cluster.mongodb.net/campuspilot` |
| `JWT_SECRET` | Secret key for JWT auth tokens | Any secure 32+ character random string |
| `CLIENT_URL` | Production Frontend URL (for CORS) | e.g. `https://campuspilot.onrender.com` or `https://campuspilot.vercel.app` |
| `GROQ_API_KEY` | Groq Real LLM API Key | `gsk_...` |
| `GROQ_MODEL` | Groq Real LLM Model | `qwen/qwen3.8-27b` (or `qwen/qwen-2.5-32b`) |

---

## Option 1: Unified Single-Service Deployment (Recommended — Render / Railway)

In this setup, the Express backend serves the built React frontend (`frontend/dist`) as static assets with full HTML5 client-side pushState routing.

### Deploying on Render:
1. Push your repository to **GitHub** or **GitLab**.
2. Go to [Render.com](https://render.com) and click **New +** ➔ **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build --prefix frontend && cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. In **Environment Variables**, add the variables from the table above.
6. Click **Deploy Web Service**.
7. Once deployed, Render provides a live URL (e.g., `https://campuspilot.onrender.com`).

---

## Option 2: Split Deployment (Vercel Frontend + Render Backend)

If you prefer deploying the React frontend on **Vercel** and the Node backend on **Render**:

### Step A: Deploy Backend on Render
1. Follow **Option 1**, but with:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
2. Add your environment variables (including `CLIENT_URL` set to your Vercel domain).
3. Note your backend URL (e.g. `https://campuspilot-api.onrender.com`).

### Step B: Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and import your Git repository.
2. Set **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://campuspilot-api.onrender.com/api`
4. The included `vercel.json` will automatically handle SPA client-side routing.
5. Click **Deploy**.

---

## Option 3: Docker & Containerized Deployment

A production multi-stage `Dockerfile` and `docker-compose.yml` are included in the repository.

### Run with Docker Compose:
```bash
# 1. Create .env with production variables
cp backend/.env .env

# 2. Build and run container
docker compose up -d --build

# 3. Check logs
docker compose logs -f
```
The application will be live at `http://localhost:5000`.

---

## 🔒 Post-Deployment Initial Setup

Once your live site is up:
1. Visit `/setup-admin` (e.g. `https://your-domain.com/setup-admin`).
2. Register your institution's initial **Placement Officer / Administrator** account.
3. Access `/admin` to launch corporate drives, review candidate profiles, and orchestrate the Real LLM Placement Agent.
