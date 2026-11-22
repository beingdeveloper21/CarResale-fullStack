# Production Deployment Guide

This project is architected for clean, zero-downtime production deployment across **Vercel** (Frontend) and **Render** (Backend API Gateway & ML Valuation Engine).

---

## 🏗️ Deployment Architecture

| Component | Service Name | Platform | Directory | Port / Domain |
|---|---|---|---|---|
| **Frontend** | `car-resale-client` | Vercel | `client/` | `https://your-app.vercel.app` |
| **Backend API** | `car-resale-api` | Render (Node Web Service) | `server/` | `https://your-api.onrender.com` |
| **ML Engine** | `car-resale-ml` | Render (Python Web Service) | `ml_backend/` | `https://your-ml.onrender.com` |

---

## 1. Prerequisites & Accounts

1. **GitHub Repository**: Pushed to `https://github.com/beingdeveloper21/CarResale-fullStack`.
2. **MongoDB Atlas**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - In *Network Access*, add `0.0.0.0/0` (allow access from anywhere) so cloud servers can connect.
   - In *Database Access*, create a database user and password.
   - Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/car-resale?retryWrites=true&w=majority`.
3. **Stripe** (for Card Payments):
   - Create an account on [Stripe](https://dashboard.stripe.com).
   - Retrieve your `STRIPE_SECRET_KEY` (`sk_test_...` or `sk_live_...`).
4. **ImageKit.io** (for Car & Profile Image Storage):
   - Sign up at [ImageKit.io](https://imagekit.io).
   - Copy `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, and `IMAGEKIT_URL_ENDPOINT`.
   *(Note: The server includes an automatic filesystem fallback if ImageKit is not configured).*
5. **SMTP Mailer** (Optional, for welcome/receipt emails):
   - Gmail app password, SendGrid, Resend, or Mailgun credentials.

---

## 2. Deploying on Render (API + ML Backend)

The repository root includes a production Blueprint specification in [`render.yaml`](./render.yaml).

### Option A: Using Render Blueprints (Recommended)
1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** &rarr; **Blueprint**.
3. Connect your GitHub repository: `beingdeveloper21/CarResale-fullStack`.
4. Render will detect `render.yaml` and configure two services:
   - `car-resale-api` (Node.js runtime)
   - `car-resale-ml` (Python 3.11 runtime)
5. Fill in the required environment variables marked `sync: false`:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: A secure random string (e.g. 32+ characters).
   - `STRIPE_SECRET_KEY`: Your Stripe secret key.
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://your-app.vercel.app`).
   - `CORS_ORIGINS`: Your Vercel frontend URL.
   - `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`: (From ImageKit).
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`: (For email notifications).
6. Click **Apply**.
7. Once `car-resale-ml` is deployed, copy its public URL (e.g. `https://car-resale-ml.onrender.com`).
8. On `car-resale-api` &rarr; **Environment**, set `ML_API_URL` to `https://car-resale-ml.onrender.com`.

### Option B: Manual Service Creation on Render

#### ML Backend Service
- **Type**: Web Service
- **Root Directory**: `ml_backend`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `MODEL_PATH`: `./models/car_price_model.joblib`

#### Express API Gateway Service
- **Type**: Web Service
- **Root Directory**: `server`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - See `server/.env.example`

---

## 3. Deploying on Vercel (Frontend)

1. Go to the [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import the `beingdeveloper21/CarResale-fullStack` repository.
4. In the project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: Click *Edit* and select `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_BASE_URL`: The public URL of your Render API (e.g. `https://car-resale-api.onrender.com`).
   - `VITE_CURRENCY`: `$` (or your preferred currency symbol).
6. Click **Deploy**.
7. Vercel will build and assign your production domain. `client/vercel.json` already contains SPA client-side routing rewrites.

---

## 4. Post-Deployment Verification

### 1. Verify ML Inference Microservice
```bash
curl https://your-ml-service.onrender.com/health
```
**Expected Response:**
```json
{
  "success": true,
  "prediction_mode": "ensemble_model",
  "model_loaded": true,
  "metrics": {
    "model_name": "CatBoost & LightGBM Leak-Free Ensemble",
    "r2_percentage": "97.79%",
    "mae": 1226.96,
    "version": "2.1.0-production"
  }
}
```

### 2. Verify Express API Gateway
```bash
curl https://your-api.onrender.com/health
```
**Expected Response:**
```json
{
  "success": true,
  "timestamp": "2026-11-23T..."
}
```

### 3. Verify End-to-End User Experience on Vercel
1. Open your Vercel URL in your browser.
2. Navigate to **AI Valuation** (`/valuation`): Test vehicle inputs and confirm instant valuation with LightGBM and CatBoost ensemble breakdowns.
3. Browse **Cars** (`/cars`): Filter by brand, condition, category, and price range.
4. Open a **Car Details** page (`/car-details/:id`): Check that the Fair Market Value and Deal Assessment Badge appear.
5. Click **Buy Now**: Test Stripe checkout redirect and payment confirmation.
