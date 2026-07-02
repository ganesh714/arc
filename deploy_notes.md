# Loom Platform Deployment Guide

This guide details how to build and host Loom's frontend and backend layers in production.

---

## 1. Backend Service (Spring Boot + Postgres on Render)

### PostgreSQL Database Setup
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **PostgreSQL**.
3. Set Database Name: `loom_db`
4. Copy the internal or external **Connection String** / **Database URL**.

### Spring Boot API Service Setup
1. Click **New +** and select **Web Service**.
2. Link your Git repository mapping the Loom backend.
3. Configure settings:
   - **Environment:** `Docker` (if Dockerfile exists) or `Java`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/loom_backend-0.0.1-SNAPSHOT.jar`
4. Set the following **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `SPRING_PROFILES_ACTIVE`: `prod`

---

## 2. Frontend Web App (React + Cloudflare Pages)

### Build Target Configuration
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm run build
   ```
2. The compilation builds static HTML/JS assets to the `dist` directory.

### Cloudflare Pages Host Setup
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git**.
3. Link your Loom frontend repository.
4. Set Build Settings:
   - **Framework Preset:** `Vite` (or None)
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
5. Configure Environment Variables under **Settings** -> **Environment Variables**:
   - `VITE_API_URL`: Your backend API base URL on Render (e.g. `https://loom-backend.onrender.com`).
6. Click **Save and Deploy**.
