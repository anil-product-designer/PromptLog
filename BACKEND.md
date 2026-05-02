# PromptLog Backend Specification & Implementation Plan

This document serves as the master blueprint for migrating the PromptLog Intelligence Hub from local storage to a production-grade cloud architecture.

---

## 1. Database Schema (PostgreSQL / Supabase)

### 1.1 `projects`
Stores high-level workspace definitions.
- `id`: `uuid` (Primary Key)
- `name`: `varchar(255)`
- `description`: `text`
- `icon`: `varchar(50)` (Emoji or identifier)
- `color`: `varchar(7)` (Hex code)
- `owner_id`: `uuid` (References `auth.users`)
- `created_at`: `timestamp with time zone`

### 1.2 `categories`
Focus areas within a project (e.g., "Discovery Calls", "Closing").
- `id`: `uuid` (Primary Key)
- `project_id`: `uuid` (Foreign Key -> `projects.id` ON DELETE CASCADE)
- `name`: `varchar(255)`
- `created_at`: `timestamp with time zone`

### 1.3 `trials`
The core logs for prompt iterations.
- `id`: `uuid` (Primary Key)
- `project_id`: `uuid` (Foreign Key -> `projects.id`)
- `category_id`: `uuid` (Foreign Key -> `categories.id` ON DELETE CASCADE)
- `version`: `varchar(20)`
- `prompt`: `text` (System directive)
- `output`: `text` (AI response)
- `finding`: `text` (Diagnosis)
- `improvement`: `text` (Strategic pivot)
- `author_name`: `varchar(255)`
- `author_id`: `uuid` (References `auth.users`)
- `date`: `timestamp with time zone`

### 1.4 `attachments`
References to files stored in cloud storage.
- `id`: `uuid` (Primary Key)
- `trial_id`: `uuid` (Foreign Key -> `trials.id` ON DELETE CASCADE)
- `file_name`: `text`
- `file_url`: `text`
- `file_type`: `varchar(100)`
- `file_size`: `varchar(50)`
- `created_at`: `timestamp with time zone`

---

## 2. API Connection Logic

### 2.1 State Synchronization (Zustand + Supabase)
The application will move from a `persist` middleware to a real-time subscription model:
1. **Initial Load**: Fetch all user-accessible projects on app mount.
2. **Subscription**: Listen for `INSERT/UPDATE/DELETE` events on the `trials` table for real-time team collaboration.
3. **Optimistic UI**: Local state updates immediately, with a "Syncing..." indicator that clears once the Supabase promise resolves.

### 2.2 Storage Workflow
1. User selects a file.
2. App generates a unique path: `project_id/trial_id/filename`.
3. File is uploaded to the `prompt-assets` bucket.
4. The resulting public URL is saved to the `attachments` table.

---

---

## 4. Pending Requirements (From User)

To begin implementation, the following credentials and configurations are required:

- [ ] **Supabase URL**: The project URL from your Supabase Settings -> API.
- [ ] **Supabase Anon Key**: The public API key from Supabase Settings -> API.
- [ ] **Service Role Key**: (Optional) Only needed if we are setting up administrative scripts.
- [ ] **Storage Bucket Name**: Confirmation of the name for the assets bucket (default: `prompt-assets`).
- [ ] **Auth Configuration**: Confirmation of which auth providers you want (e.g., Email/Password, Google).

---

## 5. Setup & Implementation Checklist

### Step 1: Environment Setup
- [ ] Create `.env` file in project root.
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] Install dependencies: `npm install @supabase/supabase-js`.

### Step 2: Database Initialization
- [ ] Run `projects` table migration.
- [ ] Run `categories` table migration.
- [ ] Run `trials` table migration.
- [ ] Run `attachments` table migration.
- [ ] Enable Row Level Security (RLS) on all tables.

### Step 3: Storage Configuration
- [ ] Create `prompt-assets` bucket in Supabase Storage.
- [ ] Set bucket privacy to "Public" (or configure signed URL logic).
- [ ] Add RLS policy to allow authenticated users to upload/delete files.

### Step 4: Frontend Integration
- [ ] Initialize Supabase client in `src/lib/supabase.js`.
- [ ] Replace `localStorage` logic in `usePromptLogStore.js` with Supabase queries.
- [ ] Implement data migration function to push existing local data to the cloud.
- [ ] Update `TrialCard` to handle persistent cloud URLs for attachments.

### Step 5: Collaboration Features
- [ ] Implement team invite logic.
- [ ] Verify RLS policies correctly filter data based on user identity.
