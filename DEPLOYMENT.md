# Deployment Guide

This application is built with **Next.js** and uses **Supabase** for the backend. The easiest and most recommended way to deploy it is using **Vercel** (the creators of Next.js).

## Prerequisites

1.  **GitHub Account**: You need to have your code pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (you can use your GitHub account).

## Step 1: Push Code to GitHub

If you haven't already, initialize a git repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repository on GitHub.com tailored to this project
# Then retrieve the remote URL and run:
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## Step 2: Import into Vercel

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Find your `garden-care-saas` repository in the list (you may need to Authorize Vercel to access your GitHub).
4.  Click **"Import"**.

## Step 3: Configure Environment Variables

**CRITICAL STEP**: Your app will not work without identifying your Supabase database.

1.  On the "Configure Project" screen in Vercel, look for the **"Environment Variables"** section.
2.  Open your local `.env.local` file.
3.  Copy and paste the keys and values into Vercel:

    *   **Key**: `NEXT_PUBLIC_SUPABASE_URL`
        *   **Value**: (Your URL starting with `https://...`)
    *   **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   **Value**: (Your long key string)

4.  Click **"Deploy"**.

## Step 4: Verification

Vercel will build your application. This usually takes 1-2 minutes.
Once complete, you will get a live URL (e.g., `https://garden-care-saas.vercel.app`).

Open that link on your phone or computer to access your live application!
