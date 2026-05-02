-- INITIAL DATABASE SCHEMA: PromptLog Intelligence Hub

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT '#7C3AED',
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES (Focus Areas)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRIALS (Iteration Logs)
CREATE TABLE IF NOT EXISTS public.trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    version TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output TEXT,
    finding TEXT,
    improvement TEXT,
    author_name TEXT DEFAULT 'Anil Patel',
    author_id UUID REFERENCES auth.users(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_id UUID REFERENCES public.trials(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES (Initial)

-- Projects: Users can see projects they created
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = owner_id);

-- Categories: Users can see categories of projects they can access
CREATE POLICY "Users can manage categories of their projects" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = categories.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Trials: Users can manage trials in their projects
CREATE POLICY "Users can manage trials in their projects" ON public.trials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = trials.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- Attachments: Users can manage attachments in their trials
CREATE POLICY "Users can manage attachments in their trials" ON public.attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.trials
            JOIN public.projects ON projects.id = trials.project_id
            WHERE trials.id = attachments.trial_id
            AND projects.owner_id = auth.uid()
        )
    );
