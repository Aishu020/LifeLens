# LifeLens - AI Memory Journal

Premium, AI-powered Memory Journal web app with AI insights, mood analytics, and a cinematic timeline experience.

## Stack

- Frontend: React + TailwindCSS + Framer Motion + Chart.js (PWA enabled)
- Backend: Node.js + Express + SQLite (pure JS via sql.js)
- Auth: JWT
- AI: Mock service (OpenAI-ready) with streaming support
- Media: Optional Cloudinary storage (fallback to local uploads)
- Collaboration: Workspaces with shared journal entries

## Folder Structure

- `frontend/` React app
- `backend/` Express API
- `shared/` shared assets & contracts

## Database Schema (SQLite)

- `users` (id, email, password_hash, name, created_at)
- `entries` (id, user_id, title, content, mood_id, mood_score, summary, image_url, location, created_at, updated_at)
- `entries` also include `workspace_id` and `is_shared`
- `tags` (id, label, color)
- `entry_tags` (entry_id, tag_id)
- `moods` (id, label, emoji, color)
- `ai_insights` (id, user_id, type, title, content, created_at)
- `streaks` (id, user_id, current_streak, longest_streak, last_entry_date, updated_at)
- `workspaces` (id, owner_id, name, created_at)
- `workspace_members` (workspace_id, user_id, role, added_at)
 - Workspace APIs: create, invite, list members, remove, leave

## Setup

1. Backend
   - `cd backend`
   - `npm install`
   - Copy `.env.example` to `.env`
   - Add `OPENAI_API_KEY` (optional for AI streaming)
   - Add Cloudinary credentials (optional for cloud image storage)
   - `npm run seed`
   - `npm run dev`

2. Frontend
   - `cd frontend`
   - `npm install`
   - Optional: Create `.env` with `VITE_API_URL=http://localhost:5000/api`
   - `npm run dev`

## Features

- Smart timeline feed with AI summary snippets and mood emoji
- Floating AI copilot (chat assistant)
- AI streaming responses with safe rate limits
- Mood analytics dashboard with trend line, pie, and heatmap
- Smart entry creation with voice-to-text, AI suggestions, and image upload
- Image crop + preview before upload
- Multi-user workspaces with shared timeline entries
- Weekly AI reflection page
- Dark/Light mode toggle
- Mobile-first bottom navigation
