# 🚀 EduSaathi - Render Hosting Guide (Supabase Version)

This guide documents how to deploy your project to production using **Render** for hosting and **Supabase** for the permanent database and authentication.

## 1. Prerequisites
- A GitHub repository with your latest code (including the `render.yaml` file).
- A Supabase account with your project and database already set up.

## 2. One-Click Deployment
1.  Log in to [Render Dashboard](https://dashboard.render.com).
2.  Click **"New +"** and select **"Blueprint"**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` file.
5.  **Service Names**:
    - Frontend: `edusaathi`
    - Backend: `edusaathi-api`
6.  **Environment Variables**: During the setup, Render will ask you for values for several keys. Fill them in as follows:
    - `DATABASE_URL`: Your Supabase connection string (**Found in Supabase Settings -> Database -> Connection String -> URI**). *Make sure to replace `[YOUR-PASSWORD]` with your actual password.*
    - `GEMINI_API_KEY`: Your Google AI key.
    - `SUPABASE_URL`: Your Supabase Project URL.
    - `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.
    - `VITE_SUPABASE_URL`: Same as `SUPABASE_URL`.
    - `VITE_SUPABASE_ANON_KEY`: Same as `SUPABASE_ANON_KEY`.

7.  **SPA Routing (Already Configured)**: The blueprint includes a **Rewrite Rule** that ensures your React Router paths work correctly even after a page refresh.

8.  **Deploy**: Click **"Apply"**. Render will create:
    - A Node.js backend (`edusaathi-api`).
    - A Static frontend (`edusaathi`).

*(The Database remains on Supabase, so it will NOT expire!)*

## 3. Post-Deployment
- Once the frontend is live, you can access it via `edusaathi.onrender.com`.
- The frontend is already configured to automatically connect to `edusaathi-api.onrender.com`.

## 4. Updates
To update your production site, simply `git push` your changes to GitHub. Render will automatically detect the push and redeploy both the frontend and backend.
