-- TEAM COLLABORATION - STABLE VERSION
-- This script fixes the infinite recursion error in RLS policies

-- 1. Create Team Members Table
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

-- 2. Clean up ALL old policies to prevent conflicts
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
DROP POLICY IF EXISTS "Owners have full access" ON public.projects;
DROP POLICY IF EXISTS "Members can view projects" ON public.projects;
DROP POLICY IF EXISTS "owner_full_control" ON public.projects;
DROP POLICY IF EXISTS "member_read_access" ON public.projects;

DROP POLICY IF EXISTS "Collaborators can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Members can view fellow team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "see_self" ON public.team_members;
DROP POLICY IF EXISTS "owner_manage_team" ON public.team_members;

-- 3. PROJECT POLICIES
-- Rule: Owners can do anything
CREATE POLICY "owner_full_control" ON public.projects
    FOR ALL USING (auth.uid() = owner_id);

-- Rule: Members can view
CREATE POLICY "member_read_access" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_members.project_id = projects.id 
            AND team_members.email = auth.jwt()->>'email'
        )
    );

-- 4. TEAM MEMBER POLICIES
-- Rule: You can see your own membership
CREATE POLICY "see_self" ON public.team_members
    FOR SELECT USING (email = auth.jwt()->>'email');

-- Rule: Project owners can manage the team
CREATE POLICY "owner_manage_team" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = team_members.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

-- 5. CATEGORIES / TRIALS / ATTACHMENTS
-- Ensuring collaborators have access

DROP POLICY IF EXISTS "Collaborators can manage categories" ON public.categories;
CREATE POLICY "category_access" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = categories.project_id 
            AND (
                projects.owner_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.team_members WHERE team_members.project_id = projects.id AND team_members.email = auth.jwt()->>'email')
            )
        )
    );

DROP POLICY IF EXISTS "Collaborators can manage trials" ON public.trials;
CREATE POLICY "trial_access" ON public.trials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = trials.project_id 
            AND (
                projects.owner_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.team_members WHERE team_members.project_id = projects.id AND team_members.email = auth.jwt()->>'email')
            )
        )
    );
