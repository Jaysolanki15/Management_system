# Vercel Deployment Guide

## What to Upload to Vercel

For Vercel, upload or push the entire project folder:

`C:\Users\Jay\management_system`

Do not upload only selected files. Vercel needs the full Next.js project structure.

## Required Files and Folders

Make sure these are included:

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.js`
- `tailwind.config.ts`
- `next-env.d.ts`
- `README.md`
- `src/`
- `docs/`
- `supabase/`
- `.env.example`

## Do Not Upload These

Do not manually upload these if they exist:

- `node_modules/`
- `.next/`
- `.env.local`
- `.env`
- npm debug logs

Vercel will install dependencies and build the app itself.

## Best Deployment Method

The best way is:

1. Create a GitHub repository.
2. Upload/push the complete `management_system` folder to GitHub.
3. Go to Vercel.
4. Click `Add New Project`.
5. Import the GitHub repository.
6. Set the framework preset to `Next.js`.
7. Add the Supabase environment variables.
8. Deploy.

## Environment Variables for Vercel

Add these in Vercel Project Settings:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these in Supabase:

`Supabase Dashboard -> Project Settings -> API`

## Supabase Database Setup

Before using the deployed app, run this SQL file in Supabase:

```text
supabase/migrations/001_initial_schema.sql
```

Steps:

1. Open Supabase Dashboard.
2. Go to `SQL Editor`.
3. Create a new query.
4. Paste the full contents of `supabase/migrations/001_initial_schema.sql`.
5. Click `Run`.

This creates:

- Products table
- Shops table
- Expenses table
- Production table
- Indexes
- Constraints
- Row Level Security policies
- Supabase Auth ownership rules

## Vercel Build Settings

Use these default settings:

```text
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

Usually Vercel detects these automatically.

## Important Notes

- Authentication is handled by Supabase Auth.
- Database and API are handled only by Supabase.
- There is no custom backend server to deploy.
- The app will not work correctly until the Supabase environment variables are added.
- The app will not store data correctly until the SQL migration is run.

## Quick Checklist

- Full project pushed to GitHub
- Supabase project created
- SQL migration executed in Supabase
- Vercel project imported from GitHub
- `NEXT_PUBLIC_SUPABASE_URL` added in Vercel
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` added in Vercel
- Vercel deployment completed

