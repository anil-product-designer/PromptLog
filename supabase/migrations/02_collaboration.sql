-- 1. Create a helper function to break RLS recursion
-- This function runs as 'postgres' to check ownership without triggering policies
CREATE OR REPLACE FUNCTION public.is_project_owner(pid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = pid AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, email)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 3. Update Project RLS Policies (Fixed Non-Recursive)
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Owners have full access" ON public.projects;
DROP POLICY IF EXISTS "Members can view projects" ON public.projects;

CREATE POLICY "Owners have full access" ON public.projects
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Members can view projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE project_id = projects.id 
            AND email = auth.jwt()->>'email'
        )
    );

-- 4. Team Members RLS (Using the Helper Function to avoid recursion)
DROP POLICY IF EXISTS "Owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Members can view fellow team members" ON public.team_members;
DROP POLICY IF EXISTS "Collaborators can view team members" ON public.team_members;

CREATE POLICY "View team membership" ON public.team_members
    FOR SELECT USING (
        (email = auth.jwt()->>'email') OR 
        (public.is_project_owner(project_id))
    );

CREATE POLICY "Manage team members" ON public.team_members
    FOR ALL USING (public.is_project_owner(project_id));

-- 5. Update Categories, Trials, Attachments RLS
-- Using the same robust owner-or-member logic

DROP POLICY IF EXISTS "Users can manage categories of their projects" ON public.categories;
DROP POLICY IF EXISTS "Collaborators can manage categories" ON public.categories;
CREATE POLICY "Collaborators can manage categories" ON public.categories
    FOR ALL USING (
        public.is_project_owner(project_id) OR
        EXISTS (SELECT 1 FROM public.team_members WHERE project_id = categories.project_id AND email = auth.jwt()->>'email')
    );

DROP POLICY IF EXISTS "Users can manage trials in their projects" ON public.trials;
DROP POLICY IF EXISTS "Collaborators can manage trials" ON public.trials;
CREATE POLICY "Collaborators can manage trials" ON public.trials
    FOR ALL USING (
        public.is_project_owner(project_id) OR
        EXISTS (SELECT 1 FROM public.team_members WHERE project_id = trials.project_id AND email = auth.jwt()->>'email')
    );

DROP POLICY IF EXISTS "Users can manage attachments in their trials" ON public.attachments;
DROP POLICY IF EXISTS "Collaborators can manage attachments" ON public.attachments;
CREATE POLICY "Collaborators can manage attachments" ON public.attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.trials
            WHERE trials.id = attachments.trial_id
            AND (
                public.is_project_owner(trials.project_id) OR 
                EXISTS (SELECT 1 FROM public.team_members WHERE project_id = trials.project_id AND email = auth.jwt()->>'email')
            )
        )
    );
